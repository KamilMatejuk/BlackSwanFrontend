<script lang="ts">
    type Trade = {
        buy_step: number,
        buy_price: number,
        sell_step: number,
        sell_price: number,
        profit: number,
    }
    export let trades: Array<Trade>

    import { onMount } from 'svelte';

    let ApexChart: any;
    onMount(async () => {
        ApexChart = (await import('svelte-apexcharts')).chart
    })

    const trades_profit = trades.filter((t: Trade) => t.profit > 0)
    const trades_loss = trades.filter((t: Trade) => t.profit < 0)

    const profit_color = '#27E43B'
    const neutral_color = '#B1BA3D'
    const loss_color = '#FF5733'

    function avg(values: Array<number>) {
        return values.reduce((acc: number, v: number) => acc + v, 0) / values.length
    }

    function deepCopy(obj: any) {
       return JSON.parse(JSON.stringify(obj));
    }

    let options = {
        chart: {
            type: 'radialBar',
            height: 200,
            offsetY: -20,
            animations: {
                enabled: false,
            },
            zoom: {
                enabled: false,
            },
        },
        plotOptions: {
            radialBar: {
                startAngle: -150,
                endAngle: 150,
                hollow: {
                    margin: 0,
                    size: '65%',
                    background: '#00000000',
                },
                track: {
                    background: '#00000000',
                    strokeWidth: '100%',
                    margin: 0,
                },
                dataLabels: {
                    name: {
                        show: false,
                    },
                    value: {
                        show: false,
                    },
                },
            },
        },
    };

let optionsProfit = deepCopy(options)
optionsProfit.series = [100 * trades_profit.length / trades.length]
optionsProfit.colors = [profit_color]
optionsProfit.plotOptions.radialBar.track.background = neutral_color
let optionsLoss = deepCopy(options)
optionsLoss.series = [100 * trades_loss.length / trades.length]
optionsLoss.colors = [loss_color]

</script>

<div class='layout'>
    {#if ApexChart}
        <div class='details'>
            <p>Profit</p>
            <p class='info'>Number</p><p class='value'>{trades_profit.length}</p>
            <p class='info'>Avg profit</p><p class='value'>{avg(trades_profit.map(t => t.profit)).toFixed(2)} $</p>
            <p class='info'>Avg profit %</p><p class='value'>{avg(trades_profit.map(t => 100 * t.profit / t.buy_price)).toFixed(2)} %</p>
            <p class='info'>Avg time</p><p class='value'>{avg(trades_profit.map(t => t.sell_step - t.buy_step)).toFixed(2)} steps</p>
        </div>
        <div class='charts'>
            <div class='chart' use:ApexChart={optionsProfit}/>
            <div class='chart loss' use:ApexChart={optionsLoss}/>
        </div>
        <div class='details'>
            <p>Loss</p>
            <p class='info'>Number</p><p class='value'>{trades_loss.length}</p>
            <p class='info'>Avg profit</p><p class='value'>{avg(trades_loss.map(t => t.profit)).toFixed(2)} $</p>
            <p class='info'>Avg profit %</p><p class='value'>{avg(trades_loss.map(t => 100 * t.profit / t.buy_price)).toFixed(2)} %</p>
            <p class='info'>Avg time</p><p class='value'>{avg(trades_loss.map(t => t.sell_step - t.buy_step)).toFixed(2)} steps</p>
        </div>
    {/if}
</div>

<style>
    .layout {
        display: grid;
        grid-template-columns: 2fr 3fr 2fr;
        align-items: flex-start;
        margin: 0 15px 20px 25px;
    }
    .details {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
    .details p {
        margin: 0;
        padding: 0;
    }
    .details p:first-of-type {
        grid-column: 1 / 3;
        text-align: center;
        font-weight: bold;
        color: #ff4000cc;
        font-size: 1.3em;
    }
    .details .info {
        color: #999999;
    }
    .details .value {
        color: #ff4000cc;
        text-align: end;
    }
    .chart {
        position: absolute;
    }
    .chart.loss {
        transform: scale(-1, 1) translateX(-2px);
    }
</style>