<script>
	import '../app.css';

	let { children } = $props();
</script>

{@render children()}
<div class="noise">
	<div></div>
</div>

<style>
	.noise {
		pointer-events: none;
		inset: 0;
		position: fixed;
		z-index: 5;

		div {
			width: 100%;
			height: 100%;
			background-size: 109px;
			background-repeat: repeat;
			background-image: url('/images/noise.png');
			opacity: 0.1;
		}
	}
</style>
