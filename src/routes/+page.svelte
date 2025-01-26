<script lang="ts">
	const { data } = $props();

	let colorScheme = $state<'dark' | 'light'>('light');
	let mode = $state<'blur' | 'color'>('blur');
	let selectedCharacter = $state('Aucun');
</script>

<header>
	<label
		>Personnage :
		<select bind:value={selectedCharacter}>
			<option>Aucun</option>
			{#each data.characters as character}
				<option>{character}</option>
			{/each}
		</select>
	</label>
	<label
		>Mode : <select bind:value={mode}>
			<option value="blur">Flouter</option>
			<option value="color">Surligner</option>
		</select>
	</label>

	<label
		>Theme :
		<select
			value={colorScheme}
			onchange={() =>
				document.documentElement.setAttribute(
					'color-scheme',
					colorScheme === 'light' ? 'dark' : 'light'
				)}
		>
			<option value="light">Clair</option>
			<option value="dark">Sombre</option>
		</select>
	</label>
</header>

<div class="page">
	<h1>Le cercle des illusionnistes</h1>
	{#each data.dialogs as dialog}
		{#if dialog.type === 'scene'}
			<h2>{dialog.name}</h2>
		{:else if dialog.type === 'dialog'}
			<p>
				<strong>{dialog.name} ({dialog.actor}) - </strong><span
					class:blur={mode === 'blur' && selectedCharacter === dialog.name}
					class:color={mode === 'color' && selectedCharacter === dialog.name}>{dialog.text}</span
				>
			</p>
		{/if}
	{/each}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap');
	header {
		position: fixed;
		display: flex;
		bottom: 0;
		width: 100%;
		gap: 1rem;
		background-color: var(--color-bg);
		padding: 1rem;
		flex-wrap: wrap;
		align-items: center;
		label {
			font-family: 'Source Serif 4', serif;
		}
		select {
			padding: 0.5rem;
			font-family: 'Source Serif 4', serif;
			font-size: 1rem;
		}
	}
	.page {
		h1 {
			text-align: center;
			padding: 0 1rem;
		}
		font-family: 'Source Serif 4', serif;
		font-optical-sizing: auto;
		margin: 0 auto 3rem;
		padding: 2rem;
		max-width: 80ch;
		font-size: 1.4rem;
		line-height: 1.7;
		h2 {
			text-align: center;
		}
		strong {
			font-style: italic;
		}
		.blur {
			filter: blur(0.5rem);
		}
		.color {
			background-color: #f3e464;
		}
	}
</style>
