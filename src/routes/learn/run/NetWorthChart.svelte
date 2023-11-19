<script lang="ts">
    type Trade = {
        buy_step: number,
        buy_price: number,
        sell_step: number,
        sell_price: number,
        profit: number,
    }
    export let trades: Array<Trade>
    export let closePrices: Array<number>
    export let minMaxStep: Array<number>

    import { onMount } from 'svelte';

    let ApexChart: any;
    onMount(async () => {
        ApexChart = (await import('svelte-apexcharts')).chart
    })

    function combineTradedIntoPrices(trades: Array<Trade>, closePrices: Array<number>) {
        const netWorth = []
        let account = 10_000
        let assets = 0
        trades.forEach((t: Trade) => {
            for (let i = netWorth.length; i < t.buy_step; i++) {
                netWorth.push(account)
            }
            assets = account / t.buy_price
            for (let i = t.buy_step; i < t.sell_step; i++) {
                netWorth.push(assets * closePrices[i])
            }
            account = assets * t.sell_price
        })
        for (let i = netWorth.length; i < closePrices.length; i++) {
            netWorth.push(account)
        }
        return netWorth
    }

    const netWorth = combineTradedIntoPrices(trades, closePrices)

    $: options = {
        chart: {
            type: 'line',
            height: 200,
            animations: {
                enabled: false,
            },
            zoom: {
                enabled: false,
            },
        },
        stroke: {
            width: 1.5,
        },
        dataLabels: {
            enabled: false
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
            min: Math.min(...netWorth.filter((p, i) => i >= minMaxStep[0] && i <= minMaxStep[1])) * 0.98,
            max: Math.max(...netWorth.filter((p, i) => i >= minMaxStep[0] && i <= minMaxStep[1])) * 1.02,
            forceNiceScale: false,
            labels: {
                formatter: (value: number) => value.toFixed(2),
            },
            tickAmount: 5,
        },
        series: [{
            data: netWorth
        }]
    }
</script>

<div class='title-container'>
    {#if ApexChart}
        <p class='title'>NetWorth</p>
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