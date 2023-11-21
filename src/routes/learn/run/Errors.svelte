<script lang="ts">
	import type { Trade } from "./+page.svelte";

    export let errors: Array<string>
    export let actions: Array<number>
    export let closePrices: Array<number>
    export let volumes: Array<number>
    export let trades: Array<Trade>
</script>

<div>
    {#if errors.length > 0}
        <ul class='message errors'>
            {#each errors as err}
                <li>{err}</li>
            {/each}
        </ul>
    {/if}
    {#if actions.length == 0 || closePrices.length == 0 || volumes.length == 0 || trades.length == 0}
        <ul class='message warning'>
            {#if actions.length == 0}
                <li>Actions are empty (0 items found)</li>
            {/if}
            {#if closePrices.length == 0}
                <li>Prices are empty (0 items found)</li>
            {/if}
            {#if volumes.length == 0}
                <li>Volumes are empty (0 items found)</li>
            {/if}
            {#if trades.length == 0}
                <li>Trades are empty (0 items found)</li>
            {/if}
        </ul>
    {/if}

</div>

<style>
    .message {
        border-radius: 10px;
        list-style: none;
        padding: 20px 40px;
        margin-top: 0;
    }
    .message li::before {
        content: '\2022';
        font-weight: bold;
        display: inline-block;
        width: 1em;
        margin-left: -1em;
    }
    .errors {
        background: #ff400011;
        border: 2px solid #ff4000cc;
    }
    .errors li::before {
        color: #ff4000;
    }
    .warning {
        background: #ffae0011;
        border: 2px solid #ffae00cc;
    }
    .warning li::before {
        color: #ffae00;
    }


</style>