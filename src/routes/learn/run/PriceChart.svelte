<script lang="ts">
    export let closePrices: Array<number>
    export let minMaxStep: Array<number>

    import { onMount } from 'svelte';

    let ApexChart: any;
    onMount(async () => {
        ApexChart = (await import('svelte-apexcharts')).chart
    })

    function convertClosePricesToCandleStick(closePrices: Array<number>){
        const candleSticks = []
        for (let i = minMaxStep[0]+1; i < minMaxStep[1]; i++) {
            const close = closePrices[i]
            const open = closePrices[i-1]
            const high = Math.max(open, close)
            const low = Math.min(open, close)
            candleSticks.push({x: i, y: [open, close, high, low]})
        }
        return candleSticks
    }

    $: options = {
        chart: {
            type: 'candlestick',
            height: 250,
            animations: {
                enabled: false,
            },
            zoom: {
                enabled: false,
            },
        },
        xaxis: {
            type: 'numeric',
            min: minMaxStep[0],
            max: minMaxStep[1],
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
            tickAmount: 7,
        },
        series: [{
            data: convertClosePricesToCandleStick(closePrices)
        }],
    }
</script>

<div class='title-container'>
    {#if ApexChart}
        <p class='title'>Price</p>
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