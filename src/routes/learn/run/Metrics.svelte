<script lang="ts">
    export let actions: Array<number>
    export let closePrices: Array<number>
    export let volumes: Array<number>
    export let trades: Array<Trade>
    export let minMaxStep: Array<number>
    
    import type { Trade } from './+page.svelte';
	import PriceChart from './PriceChart.svelte';
	import VolumeChart from './VolumeChart.svelte';
	import NetWorthChart from './NetWorthChart.svelte';

    let showTrades: boolean
</script>

<div>
    {#if actions.length > 0 && closePrices.length > 0 && volumes.length > 0}
        <label>
            <input type="checkbox" bind:checked={showTrades} />
            Show trades
        </label>
        
        <NetWorthChart actions={actions} trades={trades} closePrices={closePrices} bind:minMaxStep={minMaxStep} bind:showTrades={showTrades}/>
        <PriceChart closePrices={closePrices} bind:minMaxStep={minMaxStep}/>
        <VolumeChart actions={actions} volumes={volumes} bind:minMaxStep={minMaxStep}/>
    {/if}
</div>

<style>
    label {
        display: flex;
        justify-content: center;
    }
</style>