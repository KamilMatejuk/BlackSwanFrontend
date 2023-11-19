<script lang="ts">
    export let actions: Array<number>
    export let closePrices: Array<number>
    export let volumes: Array<number>
    export let trades: Array<Trade>
    export let minMaxStep: Array<number>
    
    import type { Trade } from './+page.svelte';
	import TradesSummary from './TradesSummary.svelte';
	import TradesChart from './TradesChart.svelte';

</script>

<div>
    {#if actions.length > 0 && closePrices.length > 0 && volumes.length > 0}
        <TradesSummary trades={trades}/>
        <TradesChart trades={trades} closePrices={closePrices} bind:minMaxStep={minMaxStep}/>
    {/if}
</div>
