<script lang="ts">
    export let trades: Array<Trade>
    export let closePrices: Array<number>
    export let minMaxStep: Array<number>

    import { onMount } from 'svelte';
	import type { Trade } from './+page.svelte';

    let ApexChart: any;
    onMount(async () => {
        ApexChart = (await import('svelte-apexcharts')).chart
    })

    function convertTradesToCandleStick(trades: Array<Trade>, closePrices: Array<number>){
        const candleSticks: Array<any> = []
        trades.forEach((t: Trade, i: number) => {
            if (t.sell_step < minMaxStep[0] || t.buy_step > minMaxStep[1]) return
            const prices = closePrices.slice(t.buy_step, t.sell_step + 1)
            const open = t.buy_price
            const close = t.sell_price
            const high = Math.max(...prices)
            const low = Math.min(...prices)
            candleSticks.push({x: i, y: [open, close, high, low]})
        })
        return candleSticks
    }

    $: options = {
        chart: {
            type: 'candlestick',
            height: 200,
            animations: {
                enabled: false,
            },
            zoom: {
                enabled: false,
            },
        },
        xaxis: {
            type: 'numeric',
            min: 0,
            max: convertTradesToCandleStick(trades, closePrices).length,
            labels: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            min: Math.min(...closePrices.filter((p, i) => i >= minMaxStep[0] && i <= minMaxStep[1])) * 0.98,
            max: Math.max(...closePrices.filter((p, i) => i >= minMaxStep[0] && i <= minMaxStep[1])) * 1.02,
            forceNiceScale: false,
            labels: {
                formatter: (value: number) => value.toFixed(2),
            },
            tickAmount: 4,
        },
        series: [{
            data: convertTradesToCandleStick(trades, closePrices)
        }],
    }
</script>

<div class='title-container'>
    {#if ApexChart}
        <p class='title'>Trades</p>
        <div use:ApexChart={options}/>
    {/if}
</div>

<style>
    .title-container {
        position: relative;
    }
    .title {
        position: absolute;
        margin: 0;
        padding: 0;
        left: 50%;
        transform: translateX(-50%);
    }
</style>