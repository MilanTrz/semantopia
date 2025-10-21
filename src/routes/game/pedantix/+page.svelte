<script lang="ts">
	import Header from '$lib/header.svelte';
	let userGuess = '';
	let tabguess: string[] = [];
	let repbody: {
		tabHiddenTitle: number[];
		tabHiddenContent: number[];
	};
	let tabTitle: number[];
	let tabContent: number[];
    let nbEssai:number = 0;

	async function newGame() {
		const response = await fetch('/game/pedantix/', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		repbody = await response.json();
		if (response.status == 201) {
			tabTitle = repbody.tabHiddenTitle;
			tabContent = repbody.tabHiddenContent;
		}
	}

	async function sendGuess() {
        nbEssai++;
		const response = await fetch('/game/pedantix/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userGuess
			})
		});
		repbody = await response.json();
		if (response.status == 201) {
			tabTitle = repbody.tabHiddenTitle;
			tabContent = repbody.tabHiddenContent;
		}
	}
</script>

<Header />
<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-3xl">
		<div class="mb-6">
			<div class="mb-8">
				<h2 class="text-4xl font-bold text-gray-900">Pédantix</h2>
				<p class="mt-1 text-gray-600">Trouvez le mot mystère grâce à la proximité sémantique</p>
				<p class="mt-2 text-sm text-gray-500">NbEssai : {nbEssai}</p>
			</div>
		</div>

		<div class="row relative mb-6 flex">
            <form on:submit|preventDefault={sendGuess}>
			<input
				id="guess"
				type="text"
				bind:value={userGuess}
				placeholder="Tapez votre proposition..."
				class="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
			/>
			<button
				class="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
				type="submit">
                Envoyer
            </button>
            </form>
		</div>

		<div class="mb-6 rounded-lg p-6">
			<p class="mb-4 text-sm text-gray-600">
				{#each tabTitle as item}
					{#if typeof item === 'number'}
						■{' '}
					{:else}
						{item}{' '}
					{/if}
				{/each}
			</p>
			<p class="h-32 w-full focus:outline-none">
				{#each tabContent as item}
					{#if typeof item === 'number'}
						■{' '}
					{:else}
						{item}{' '}
					{/if}
				{/each}
			</p>
		</div>

		<div
			class="mb-6 rounded-lg border-2 border-blue-400 bg-gradient-to-br from-purple-50 to-pink-50 p-6"
		>
			<div class="grid grid-cols-2 gap-x-8 gap-y-2">
				{#each tabguess as guess, index}
					<li class="text-gray-700">
						<span class="font-medium">{index + 1}.</span>
						{guess}
					</li>
				{/each}
			</div>
		</div>

		<div class="flex gap-4">
			<button
				class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
				on:click={newGame}
			>
				🔄 Nouvelle partie
			</button>
			<button
				class="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700"
			>
				📤 Partager résultat
			</button>
		</div>
	</div>
</div>
