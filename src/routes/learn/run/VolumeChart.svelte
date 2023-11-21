<script lang="ts">
    export let actions: Array<number>
    export let volumes: Array<number>

    import { onMount } from 'svelte';

    let ApexChart: any;
    onMount(async () => {
        ApexChart = (await import('svelte-apexcharts')).chart
    })

    $: options = {
        chart: {
            type: 'bar',
            height: 100,
            animations: {
                enabled: false,
            },
            zoom: {
                enabled: false,
            },
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            type: 'numeric',
            min: 0,
            max: volumes.length - 1,
            labels: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            min: Math.min(...volumes) * 0.98,
            max: Math.max(...volumes) * 1.02,
            forceNiceScale: false,
            labels: {
                formatter: (value: number) => value.toFixed(1),
            },
            tickAmount: 2,
        },
        series: [{
            data: volumes
        }]
    }
</script>

<div class='title-container'>
    {#if ApexChart}
        <p class='title'>Volume</p>
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