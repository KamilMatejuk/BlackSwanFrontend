<script lang="ts">
    export let actions: Array<number>
    export let closePrices: Array<number>
    export let volumes: Array<number>
    export let trades: Array<Trade>
    export let minMaxStep: Array<number>
    export let showTrades: boolean
    
    import type { Trade } from './+page.svelte';
    import Slider from '@bulatdashiev/svelte-slider';
	import PriceChart from './PriceChart.svelte';
	import VolumeChart from './VolumeChart.svelte';
	import NetWorthChart from './NetWorthChart.svelte';

    let tempMinMaxStep = [0, closePrices.length - 1]
</script>

<div role='button' tabindex='-1' on:mouseup={() => {minMaxStep = tempMinMaxStep}}>
    {#if actions.length > 0 && closePrices.length > 0 && volumes.length > 0}
        <label>
            <input type="checkbox" bind:checked={showTrades} />
            Show trades
        </label>
        <div class="timeframe">
            <Slider
                bind:value={tempMinMaxStep}
                min={0}
                max={closePrices.length - 1}
                step={10}
                order={true}
                range/>
        </div>
        <NetWorthChart actions={actions} trades={trades} closePrices={closePrices} bind:minMaxStep={minMaxStep} bind:showTrades={showTrades}/>
        <PriceChart closePrices={closePrices} bind:minMaxStep={minMaxStep}/>
        <VolumeChart actions={actions} volumes={volumes} bind:minMaxStep={minMaxStep}/>
    {/if}
</div>

<style>
    .timeframe {
		--progress-bg: #ff4000cc;
		--thumb-bg: #ff4000;
		display: flex;
		justify-content: center;
        margin-left: 25px;
        margin-right: 10px;
	}
    label {
        display: flex;
        justify-content: center;
    }
</style>