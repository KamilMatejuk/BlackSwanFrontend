<script lang="ts">
	import loader from '$lib/images/loader.svg'
	import Details from './Details.svelte'
	import Errors from './Errors.svelte'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { mlflowGet } from '../../../mlflow'

	const id = $page.url.searchParams.get('id') || ''
	
	let isLoadingTrain = true
	let errorsTrain: Array<String> = []
	let closePricesTrain: Array<Number> = []
	let actionsTrain: Array<Number> = []
	let volumesTrain: Array<Number> = []

	let isLoadingTest = true
	let errorsTest: Array<String> = []
	let closePricesTest: Array<Number> = []
	let actionsTest: Array<Number> = []
	let volumesTest: Array<Number> = []
	
	async function getMetric(metric_name: String): Promise<Array<Number>> {
		type Metric = { key: String, value: Number, timestamp: Number, step: Number }
		const values = await mlflowGet(`metrics/get-history?run_id=${id}&metric_key=${metric_name}`)
		if (!values.correct) {
			if (metric_name.includes('test')) errorsTest.push(`Failed getting metric ${metric_name}: ${values.error}`)
			if (metric_name.includes('train')) errorsTrain.push(`Failed getting metric ${metric_name}: ${values.error}`)
			return []
		}
		return values.metrics.sort((v: Metric) => v.step).map((v: Metric) => v.value)
	}

	async function getDatafile(param_data: any, param_name: String) {
		type Param = { key: String, value: String }
		const filename = param_data.run.data.params.filter((p: Param) => p.key == param_name).map((p: Param) => p.value)[0]
		if (!filename) {
			if (param_name.includes('test')) errorsTest.push(`Failed loading datafile ${param_name}`)
			if (param_name.includes('train')) errorsTrain.push(`Failed loading datafile ${param_name}`)
			return { close: [], volume: [] }
		}
		const data = await fetch(`/data/${filename}?url`)
			.then(response => response.json())
			.then(data => ({
					close: Object.keys(data.close).sort().map(key => data.close[key]),
					volume: Object.keys(data.volume).sort().map(key => data.volume[key]),
				})
			).catch((error) => {
				if (param_name.includes('test')) errorsTest.push(`Failed loading datafile ${param_name}: ${error}`)
				if (param_name.includes('train')) errorsTrain.push(`Failed loading datafile ${param_name}: ${error}`)
				return { close: [], volume: [] }
			})
		return data
	}

	onMount(async () => {
		if (id.length == 0) {
			alert(`Failed getting run info: Parameter id is required`)
			isLoadingTrain = false
			isLoadingTest = false
			return
		}
		const data = await mlflowGet(`runs/get?run_id=${id}`)
		if (!data.correct) {
			alert(`Failed getting run info: ${data.error}`)
			isLoadingTrain = false
			isLoadingTest = false
			return
		}
		actionsTrain = await getMetric('train/action')
		actionsTest = await getMetric('test/action')

		const train_datafile = await getDatafile(data, 'train_data')
		isLoadingTrain = false
		closePricesTrain = train_datafile.close
		volumesTrain = train_datafile.volume

		const test_datafile = await getDatafile(data, 'test_data')
		isLoadingTest = false
		closePricesTest = test_datafile.close
		volumesTest = test_datafile.volume
	})
	
</script>

<svelte:head>
	<title>Run</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
	<h1>Run {id}</h1>
	<h2>Train</h2>
	<!-- {#if isLoadingTrain}
		<div class="loader"><img src={loader} alt='loader'/></div>
	{:else}
		<Errors
			actions={actionsTrain}
			closePrices={closePricesTrain}
			volumes={volumesTrain}
			errors={errorsTrain}/>
		<Details
			actions={actionsTrain}
			closePrices={closePricesTrain}
			volumes={volumesTrain}/>
	{/if} -->
	<h2>Test</h2>
	{#if isLoadingTest}
		<div class="loader"><img src={loader} alt='loader'/></div>
	{:else}
		<Errors
			actions={actionsTest}
			closePrices={closePricesTest}
			volumes={volumesTest}
			errors={errorsTrain}/>		
		<Details
			actions={actionsTest}
			closePrices={closePricesTest}
			volumes={volumesTest}/>
	{/if}
</div>


<style>
	.loader {
		min-height: 30vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.loader img {
		height: 10vh;
	}
</style>
