<script lang="ts">
	import rightArrow from '$lib/images/right-arrow.svg'
	import loader from '$lib/images/loader.svg'
	import { onMount } from 'svelte';
	import { mlflowPost } from '../../mlflow'

	type Run = { name: string, time: number, id: string, train_epochs: number }

	let isLoading = true;
	let runs: Array<Run> = [];

	onMount(async () => {
		const experiments = await mlflowPost("experiments/search", { max_results: 1000 }) as Record<string, any>
		if (!experiments.correct) {
			alert(`Failed getting experiments: ${experiments.error}`)
			isLoading = false;
			return
		}
		const experiment_ids = experiments.experiments.map((e: Record<string, string>) => e.experiment_id)
		const data = await mlflowPost("runs/search", { experiment_ids: experiment_ids })
		if (!data.correct) {
			alert(`Failed getting experiments: ${data.error}`)
			isLoading = false;
			return
		}
		runs = data.runs
		.filter((run: Record<string, any>) => run.info) 
		.filter((run: Record<string, any>) => run.data) 
		.filter((run: Record<string, any>) => run.data.params) 
		.map((run: Record<string, any>) => ({
			name: run.info.run_name,
			time: run.info.start_time,
			id: run.info.run_id,
			train_epochs: (run.data.params.filter((p: Record<string, string>) => p.key == 'epochs')[0] || {value: 0}).value
		} as Run))
		isLoading = false;
	})

</script>

<svelte:head>
	<title>Learn</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
	<h1>MLflow Experiments</h1>
	{#if isLoading}
		<div class="loader"><img src={loader} alt='loader'/></div>
	{:else}
		<div class='row'><p>Time</p><p>Name</p><p>ID</p><p></p></div>
		{#each runs as run}
		<div class='row'>
			<p>{new Date(run.time).toLocaleDateString("pl-PL", { 
				year: 'numeric', 
				month: 'numeric', 
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
				hour12: false,
			})}</p>
			<p>{run.name}</p>
			<p>{run.id}</p>
			<a href="/learn/run?id={run.id}"><img src={rightArrow} alt=''/></a>
		</div>
		{/each}
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
	.row {
		display: grid;
		grid-template-columns: 3fr 3fr 5fr 50px 50px;
		padding: 10px;
		border-top: 1px solid #ff4000cc;
	}
	.row:first-of-type {
		border-top: none;
		border-bottom: 2px solid #ff4000;
	}
	.row:first-of-type p {
		font-weight: bold;
		color: #ff4000;
	}
	.row p {
		margin: 0;
		padding: 0;
	}
	.row a {
		display: flex;
	    justify-content: center;
	}
	.row img {
		width: 20px
	}
</style>
