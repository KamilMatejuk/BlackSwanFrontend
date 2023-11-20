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
	let stages: Array<String> = []
	let errors: Array<String> = []
	let closePrices: Array<number> = []
	let actions: Array<number> = []
	let volumes: Array<number> = []
	let trades: Array<Trade> = []
	let minMaxStep: Array<number> = []
	let showTrades: boolean = false

	async function getMetric(metric_name: String): Promise<Array<number>> {
		type Metric = { key: String, value: number, timestamp: number, step: number }
		const values = await mlflowGet(`metrics/get-history?run_id=${id}&metric_key=${metric_name}`)
		if (!values.correct) {
			errors.push(`Failed getting metric ${metric_name}: ${values.error}`)
			return []
		}
		return values.metrics.sort((v: Metric) => v.step).map((v: Metric) => v.value)
	}

	async function getDatafile(param_data: any, param_name: String) {
		type Param = { key: String, value: String }
		const filename = param_data.run.data.params.filter((p: Param) => p.key == param_name).map((p: Param) => p.value)[0]
		if (!filename) {
			errors.push(`Failed loading datafile ${param_name}`)
			return { close: [], volume: [] }
		}
		const data = await fetch(`/data/${filename}?url`)
			.then(response => response.json())
			.then(data => ({
					close: Object.keys(data.close).sort().map(key => data.close[key]),
					volume: Object.keys(data.volume).sort().map(key => data.volume[key]),
				})
			).catch((error) => {
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
        if (('buy_step' in trade) && !('sell_step' in trade)) {
            const i = actions.length - 1
			if (closePrices[i]) {
				trade['sell_step'] = i
				trade['sell_price'] = closePrices[i]
				trade['profit'] = trade['sell_price'] - trade['buy_price']
				trades.push(trade)
			}
        }
        return trades        
    }


	onMount(async () => {
		if (id.length == 0) {
			alert(`Failed getting run info: Parameter id is required`)
			isLoading = false
			return
		}
		const data = await mlflowGet(`runs/get?run_id=${id}`)
		if (!data.correct) {
			console.log('error', data.error)
			alert(`Failed getting run info: ${data.error}`)
			isLoading = false
			return
		}
		stages = data.run.data.metrics
			.map((m: any) => m.key)
			.filter((m: string) => m.includes('/action'))
			.map((m: string) => m.replace('/action', ''))
			.sort((m1: string, m2: string) => parseInt(m1.split('/')[1]) - parseInt(m2.split('/')[1]))
		actions = await getMetric(`${stage}/action`)
		let datafile
		if (stage.includes('train')) {
			datafile = await getDatafile(data, 'train_data')
		} else {
			datafile = await getDatafile(data, 'test_data')
		}
		closePrices = datafile.close
		volumes = datafile.volume
		trades = convertActionsToTrades(actions, closePrices)
		minMaxStep = [0, closePrices.length - 1]
		isLoading = false
		// console.log(closePrices)
		// console.log(volumes)
		// console.log(actions)
		// console.log(trades)
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
				actions={actions}
				closePrices={closePrices}
				volumes={volumes}
				errors={errors}
				trades={trades}/>
		</div>
		<div class="data">
			<div>
				<Metrics
					bind:minMaxStep={minMaxStep}
					bind:showTrades={showTrades}
					actions={actions}
					closePrices={closePrices}
					volumes={volumes}
					trades={trades}/>
			</div>
			<div>
				<Trades
					bind:minMaxStep={minMaxStep}
					actions={actions}
					closePrices={closePrices}
					volumes={volumes}
					trades={trades}/>
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
</style>
