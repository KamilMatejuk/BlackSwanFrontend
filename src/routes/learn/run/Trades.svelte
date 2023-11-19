<script lang="ts">
    export let actions: Array<number>
    export let closePrices: Array<number>
    export let volumes: Array<number>
    export let trades: Array<Trade>
    export let minMaxStep: Array<number>
    
    import type { Trade } from './+page.svelte';
    import rightArrow from '$lib/images/right-arrow.svg'
	import TradesSummary from './TradesSummary.svelte';
	import TradesChart from './TradesChart.svelte';

</script>

<div>
    {#if actions.length > 0 && closePrices.length > 0 && volumes.length > 0}
        <TradesSummary trades={trades}/>
        <TradesChart trades={trades} closePrices={closePrices} bind:minMaxStep={minMaxStep}/>
		<div class='row header'><p>Enter</p><p>Exit</p><p>Profit/Loss</p><p>Fee</p><p></p></div>
        {#each trades as trade}
		    <div class='row'>
                <p>{trade.buy_step} @ {trade.buy_price} $</p>
                <p>{trade.sell_step} @ {trade.sell_price} $</p>
                <p class={trade.profit > 0 ? 'profit' : 'loss'}>
                    {trade.profit.toFixed(2)}$ ({(100 * trade.profit / trade.buy_price).toFixed(2)}%)</p>
                <p>0.00$</p>
                <a href='#'><img src={rightArrow} alt=''/></a>
            </div>
        {/each}
    {/if}
</div>

<style>
    .row {
		display: grid;
		grid-template-columns: 2fr 2fr 2fr 0.75fr 30px;
		padding: 2px;
        margin: 0 7px 0 20px;
		border-top: 1px solid #ff4000cc;
	}
	.row.header {
		border-top: none;
		border-bottom: 1px solid #ff4000cc;
	}
	.row.header p {
		font-weight: bold;
		color: #ff4000cc;
	}
    .row .profit {
        color: #27E43B;
    }
    .row .loss {
        color: #FF5733;
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