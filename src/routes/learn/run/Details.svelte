<script lang="ts">
    export let actions: Array<number>
    export let closePrices: Array<number>
    export let volumes: Array<number>
    
    import Slider from '@bulatdashiev/svelte-slider';
	import PriceChart from './PriceChart.svelte';
	import VolumeChart from './VolumeChart.svelte';
	import NetWorthChart from './NetWorthChart.svelte';
	import TradesSummary from './TradesSummary.svelte';
	import TradesChart from './TradesChart.svelte';

    let minMaxStep = [0, closePrices.length - 1]
    let tempMinMaxStep = [0, closePrices.length - 1]

    function convertActionsToTrades(actions: Array<number>, closePrices: Array<number>){
        const trades = []
        let trade: any = {}
        for (let i = 0; i < actions.length; i++) {
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
            trade['sell_step'] = i
            trade['sell_price'] = closePrices[i]
            trade['profit'] = trade['sell_price'] - trade['buy_price']
            trades.push(trade)
        }
        return trades        
    }

    const trades = convertActionsToTrades(actions, closePrices)

</script>

<div>
    {#if actions.length > 0 && closePrices.length > 0 && volumes.length > 0}
        <div class="timeframe" role='button' tabindex='-1' on:mouseup={() => {minMaxStep = tempMinMaxStep}}>
            <Slider
                bind:value={tempMinMaxStep}
                min={0}
                max={closePrices.length - 1}
                step={10}
                order={true}
                range/>
        </div>
        <NetWorthChart trades={trades} closePrices={closePrices} bind:minMaxStep={minMaxStep}/>
        <PriceChart actions={actions} closePrices={closePrices} bind:minMaxStep={minMaxStep}/>
        <VolumeChart actions={actions} volumes={volumes} bind:minMaxStep={minMaxStep}/>
        <TradesSummary  trades={trades}/>
        <TradesChart trades={trades} closePrices={closePrices} bind:minMaxStep={minMaxStep}/>
    {/if}
</div>

<style>
    .timeframe {
		--progress-bg: #ff4000cc;
		--thumb-bg: #ff4000;
		display: flex;
		justify-content: center;
	}
</style>