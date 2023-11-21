<script lang="ts" context="module">
	export type Trade = {
        buy_step: number,
        buy_price: number,
        sell_step: number,
        sell_price: number,
        profit: number,
    }
</script>
<script lang="ts">
    import Slider from '@bulatdashiev/svelte-slider';
	import loader from '$lib/images/loader.svg'
	import Trades from './Trades.svelte'
	import Metrics from './Metrics.svelte';
	import Errors from './Errors.svelte'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { mlflowGet } from '../../../mlflow'

	const id = $page.url.searchParams.get('id') || ''
	const stage = $page.url.searchParams.get('stage') || 'test/1'
	
	let isLoading = true
	let errors: Array<string> = []
	let stages: Array<string> = []
	let closePrices: Record<string, Array<number>> = {}
	let volumes: Record<string, Array<number>> = {}
	let actions: Record<string, Array<number>> = {}
	let trades: Record<string, Array<Trade>> = {}
	
	let stagePrice: Array<number> = []
	let stageVolume: Array<number> = []
	let stageAction: Array<number> = []
	let stageTrade: Array<Trade> = []
	let stageMinMaxStep: Array<number> = []


	function saveToLocalStorage() {
		localStorage.setItem(id, JSON.stringify({
			stages: stages,
			closePrices: closePrices,
			volumes: volumes,
			actions: actions,
			trades: trades,
		}))
	}

	function getFromLocalStorage() {
		const stored = localStorage.getItem(id);
		if (!stored) return false
		const stored_obj = JSON.parse(stored)
		console.log('Loaded from storage', stored_obj)
		stages = stored_obj.stages as Array<string>
		closePrices = stored_obj.closePrices as Record<string, Array<number>>
		volumes = stored_obj.volumes as Record<string, Array<number>>
		actions = stored_obj.actions as Record<string, Array<number>>
		trades = stored_obj.trades as Record<string, Array<Trade>>
		return true
	}

	async function getFromMlflow() {
		const data = await mlflowGet(`runs/get?run_id=${id}`)
		if (!data.correct) {
			console.log('error', data.error)
			alert(`Failed getting run info: ${data.error}`)
			return false
		}
		stages = data.run.data.metrics
			.map((m: any) => m.key)
			.filter((m: string) => m.includes('/action'))
			.map((m: string) => m.replace('/action', ''))
			.sort((m1: string, m2: string) => parseInt(m1.split('/')[1]) - parseInt(m2.split('/')[1]))

		await Promise.all(
			['train', 'test'].map(async (stage: string) => {
				const datafile = await getDatafile(data, `${stage}_data`)
				closePrices[stage] = datafile.close
				volumes[stage] = datafile.volume
			})
		)
		await Promise.all(
			stages.map(async (stage: string) => {
				actions[stage] = await getMetric(`${stage}/action`)
				trades[stage] = convertActionsToTrades(actions[stage], closePrices[stage.split('/')[0]])
			})
		)
		return true
	} 

	async function getMetric(metric_name: string): Promise<Array<number>> {
		type Metric = { key: string, value: number, timestamp: number, step: number }
		const values = await mlflowGet(`metrics/get-history?run_id=${id}&metric_key=${metric_name}`)
		if (!values.correct) {
			errors.push(`Failed getting metric ${metric_name}: ${values.error}`)
			return []
		}
		return values.metrics.sort((v: Metric) => v.step).map((v: Metric) => v.value)
	}

	async function getDatafile(param_data: any, param_name: string) {
		type Param = { key: string, value: string }
		const filename = param_data.run.data.params.filter((p: Param) => p.key == param_name).map((p: Param) => p.value)[0]
		if (!filename) {
			errors.push(`Failed loading datafile ${param_name}`)
			return { close: [], volume: [] }
		}
		const data = await fetch(`/data/${filename}?url`)
			.then(response => response.json())
			.then(data => ({
				close: Object.keys(data.close).sort((a, b) => parseInt(a) - parseInt(b)).map(key => data.close[key]),
				volume: Object.keys(data.volume).sort((a, b) => parseInt(a) - parseInt(b)).map(key => data.volume[key]),
			})).catch((error) => {
				errors.push(`Failed loading datafile ${param_name}: ${error}`)
				return { close: [], volume: [] }
			})
		return data
	}

	function convertActionsToTrades(actions: Array<number>, closePrices: Array<number>){
        const trades = []
        let trade: any = {}
        for (let i = 0; i < actions.length; i++) {
			if (!closePrices[i]) break
            if (actions[i] == 1 && !('buy_step' in trade)) {
                trade['buy_step'] = i
                trade['buy_price'] = closePrices[i]
                continue
            }
            if (actions[i] == 2 && ('buy_step' in trade)) {
                trade['sell_step'] = i
                trade['sell_price'] = closePrices[i]
                trade['profit'] = trade['sell_price'] - trade['buy_price']
                trades.push(trade)
                trade = {}
                continue
            }
        }
        // if (('buy_step' in trade) && !('sell_step' in trade)) {
        //     const i = actions.length - 1
		// 	if (closePrices[i]) {
		// 		trade['sell_step'] = i
		// 		trade['sell_price'] = closePrices[i]
		// 		trade['profit'] = trade['sell_price'] - trade['buy_price']
		// 		trades.push(trade)
		// 	}
        // }
        return trades        
    }

	function updateStage() {
		stagePrice = closePrices[stage.split('/')[0]]
		stageVolume = volumes[stage.split('/')[0]]
		stageAction = actions[stage]
		stageTrade = trades[stage]
		stageMinMaxStep = [0, stagePrice.length - 1]
	}

	function updateSelectedRange() {
		const [rangeStart, rangeEnd] = stageMinMaxStep
		stagePrice = closePrices[stage.split('/')[0]].filter((v: number, i: number) => (i >= rangeStart && i <= rangeEnd))
		stageVolume = volumes[stage.split('/')[0]].filter((v: number, i: number) => (i >= rangeStart && i <= rangeEnd))
		stageAction = actions[stage].filter((v: number, i: number) => (i >= rangeStart && i <= rangeEnd))
		stageTrade = trades[stage].filter((v: Trade) => (v.buy_step >= rangeStart && v.sell_step <= rangeEnd))
	}

	onMount(async () => {
		if (id.length == 0) {
			alert(`Failed getting run info: Parameter id is required`)
			isLoading = false
			return
		}
		if (getFromLocalStorage()) {
			updateStage()
			isLoading = false
			return
		}
		if (await getFromMlflow()) {
			saveToLocalStorage()
			updateStage()
			isLoading = false
			return
		}
		isLoading = false
	})
	
</script>

<svelte:head>
	<title>Run</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div>
	<h2>Run {id} ({stage})</h2>
	<div class="stages">
		{#each stages as st}
			<a class={stage == st ? 'selected' : ''}
				on:click={() => window.location.href = `/learn/run?id=${id}&stage=${st}`}>{st}</a>
		{/each}
	</div>
	{#if isLoading}
		<div class="loader"><img src={loader} alt='loader'/></div>
	{:else}
		<div class="errors">
			<Errors
				actions={stageAction}
				closePrices={stagePrice}
				volumes={stageVolume}
				errors={errors}
				trades={stageTrade}/>
		</div>
		<div
			class="data"
			role='button'
			tabindex='-1'
			on:mouseup={updateSelectedRange}>
			<div>
				<div class="timeframe">
					<Slider
						bind:value={stageMinMaxStep}
						min={0}
						max={closePrices[stage.split('/')[0]].length - 1}
						step={10}
						order={true}
						range/>
				</div>
				<Metrics
					actions={stageAction}
					closePrices={stagePrice}
					volumes={stageVolume}
					trades={stageTrade}/>
			</div>
			<div>
				<Trades
					actions={stageAction}
					closePrices={stagePrice}
					volumes={stageVolume}
					trades={stageTrade}/>
			</div>
		</div>
	{/if}
</div>

<style>
	h2 {
		text-align: center;
	}
	.stages {
		margin: auto;
		max-width: 800px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
	.stages > a {
		border: 1px solid #ff3e00;
		border-radius: 5px;
		padding: 5px;
		margin: 5px;
		cursor: pointer;
	}
	.stages > a.selected {
		font-weight: bold;
		border-width: 2px;
		background-color: #ff3e0022;
	}
	.loader {
		min-height: 30vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.loader img {
		height: 10vh;
	}
	.errors, .data {
		margin: auto;
		max-width: 800px;
	}
	.data {
		display: grid;
		grid-template-columns: 1fr;
	}
	@media only screen and (min-width: 1450px) {
		.data {
			max-width: 1400px;
			grid-template-columns: 1fr 1fr;
			grid-gap: 25px;
		}
	}
    .timeframe {
		--progress-bg: #ff4000cc;
		--thumb-bg: #ff4000;
		display: flex;
		justify-content: center;
        margin-left: 25px;
        margin-right: 10px;
	}
</style>
