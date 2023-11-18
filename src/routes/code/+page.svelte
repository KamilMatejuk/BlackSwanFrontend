<script>
	import github from '$lib/images/github.svg';
	import dagshub from '$lib/images/dagshub.svg';
	const links = [
		{ url: 'https://dagshub.com/hamsterkmak/black-swan-experiments', name: 'DagsHub Experiments Pipeline', icon: dagshub },
		{ url: 'https://github.com/KamilMatejuk/BlackSwan.git', name: 'Manager', icon: github },
		{ url: 'https://github.com/cloudjubei/BlackSwanSignalEmitter.git', name: 'Signal Emitter', icon: github },
		{ url: 'https://github.com/cloudjubei/BlackSwanPriceEmitter.git', name: 'Price Emitter', icon: github },
		{ url: 'https://github.com/KamilMatejuk/BlackSwanTempPriceEmitter.git', name: 'Temp Price Emitter (from file)', icon: github },
		{ url: 'https://github.com/cloudjubei/BlackSwanTradingBot.git', name: 'Trading Bot', icon: github },
		{ url: 'https://github.com/KamilMatejuk/BlackSwanModelBasic.git', name: 'Model Basic', icon: github },
		{ url: 'https://github.com/KamilMatejuk/BlackSwanModelRL.git', name: 'Model Reinforcement Learning', icon: github },
		{ url: 'https://github.com/KamilMatejuk/BlackSwanBacktester.git', name: 'Backtester', icon: github },
		{ url: 'https://github.com/KamilMatejuk/BlackSwanLearner.git', name: 'Learner', icon: github },
	]
</script>

<svelte:head>
	<title>Code</title>
	<meta name="description" content="Source code links" />
</svelte:head>

<div class="text-column">
	<h1>Source Code links</h1>
	<ul>
		{#each links as link}
			<li><img src={link.icon} alt=''/><a href={link.url} target='_blank'>{link.name}</a></li>
		{/each}
	</ul>
</div>

<style>
	li {
		display: flex;
		flex-direction: row;
		justify-content: start;
		align-items: center;
	}
	li img {
		width: 40px;
		margin-right: 10px;
	}
</style>