<script lang="ts">
    export let trades: Array<Trade>
    export let closePrices: Array<number>

    import { onMount } from 'svelte';
	import type { Trade } from './+page.svelte';

    let ApexChart: any;
    onMount(async () => {
        ApexChart = (await import('svelte-apexcharts')).chart
    })

    function convertTradesToCandleStick(trades: Array<Trade>, closePrices: Array<number>){
        const candleSticks: Array<any> = []
        trades.forEach((t: Trade) => {
            const prices = closePrices.slice(t.buy_step, t.sell_step + 1)
            const open = t.buy_price
            const close = t.sell_price
            const high = Math.max(...prices)
            const low = Math.min(...prices)
            candleSticks.push({x: t.buy_step, y: [open, high, low, close]})
        })
        return candleSticks
    }

    $: candleSticks = convertTradesToCandleStick(trades, closePrices)

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
            min: candleSticks[0].x,
            max: candleSticks[candleSticks.length - 1].x,
            labels: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            min: Math.min(...candleSticks.map(cs => cs.y[3])) * 0.98,
            max: Math.max(...candleSticks.map(cs => cs.y[2])) * 1.02,
            forceNiceScale: false,
            labels: {
                formatter: (value: number) => value.toFixed(2),
            },
            tickAmount: 4,
        },
        series: [{
            data: candleSticks
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