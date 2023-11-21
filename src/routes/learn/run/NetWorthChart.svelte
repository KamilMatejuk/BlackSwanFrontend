<script lang="ts">
    type Trade = {
        buy_step: number,
        buy_price: number,
        sell_step: number,
        sell_price: number,
        profit: number,
    }
    export let actions: Array<number>
    export let trades: Array<Trade>
    export let closePrices: Array<number>
    export let showTrades: boolean

    import { onMount } from 'svelte';

    let ApexChart: any;
    onMount(async () => {
        ApexChart = (await import('svelte-apexcharts')).chart
    })

    function convertToVericalLines(actions: Array<number>, action: number, label: string, color: string){
        if (!showTrades) return []
        const lines = []
        const transparent = '#00000000'
        for (let i = 0; i < actions.length; i++) {
            if (actions[i] != action) continue
            lines.push({
                x: i,
                borderColor: color,
                label: {
                    text: label,
                    position: 'top',
                    borderColor: transparent,
                    style: {
                        background: transparent,
                        color: color
                    },
                }
            })
        }
        return lines
    }

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

    $: netWorth = combineTradedIntoPrices(trades, closePrices)

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
            min: 0,
            max: netWorth.length - 1,
            labels: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            min: Math.min(...netWorth) * 0.98,
            max: Math.max(...netWorth) * 1.02,
            forceNiceScale: false,
            labels: {
                formatter: (value: number) => value.toFixed(2),
            },
            tickAmount: 5,
        },
        series: [{
            data: netWorth
        }],
        annotations: {
            xaxis: [
                ...convertToVericalLines(actions, 1, 'buy', '#df4fb6'),
                ...convertToVericalLines(actions, 2, 'sell', '#4f1c82'),
            ]
        }
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