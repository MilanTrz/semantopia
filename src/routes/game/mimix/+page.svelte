<script lang="ts">
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	import { sessionStore } from '$lib/store/sessionStore';
	let nbIntruderFind: number = 0;
	let isLoading: boolean = true;
	const session = sessionStore.get();
	const idUser: number | null = session ? session.id : 0;
	let sessionId: string = '';
	let isGameOver: boolean = false;
	let tabShuffleWord: string[] = [];
	let wordIntruder: string = '';
	let foundIntruder: boolean;

	async function newGame() {
		isLoading = true;
		isGameOver = false;
		nbIntruderFind = 0;
		if (idUser === null) {
			console.error('idUser est null');
			return;
		}
		const url = `/game/mimix?userId=${encodeURIComponent(idUser)}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		const data = await response.json();
		sessionId = data.sessionId;
		tabShuffleWord = data.tabShuffleWord;
		isLoading = false;
	}
	async function sendGuess(word: string) {
		const response = await fetch('/game/mimix', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				word,
				sessionId
			})
		});

		const data = await response.json();
		console.log('data' + data);
		foundIntruder = data.isWin;
		if (foundIntruder) {
			nbIntruderFind++;
			tabShuffleWord = data.newTabShuffleWord;
		} else {
			gameOver();
		}
	}
	async function gameOver() {
		isGameOver = true;
		const response = await fetch('/game/mimix', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sessionId
			})
		});
		const data = await response.json();
		wordIntruder = data.wordIntruder;
	}

	onMount(() => {
		newGame();
	});
</script>

<Header />
<div class="row flex min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-3xl">
		<div class="mb-6">
			<div class="mb-8">
				<h2 class="text-4xl font-bold text-gray-900">Mimix</h2>
				<p class="mt-1 text-gray-600">Trouvez le plus de fois l'intrus parmi les 4 propositions</p>
				<p>Nombre d'intrus trouvés : {nbIntruderFind}</p>
			</div>
		</div>
		{#if isLoading}
			<div class="flex flex-col items-center justify-center py-12">
				<div
					class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"
				></div>
				<p class="font-medium text-gray-600">Chargement de la partie...</p>
			</div>
		{/if}
		{#if isGameOver}
			<div
				class="flex h-40 items-center justify-center rounded-lg border-2 border-red-500 bg-red-100 p-6"
			>
				<p class="text-3xl font-bold text-red-700">
					Partie terminée, vous avez deviné {nbIntruderFind} intrus. Le dernier intrus était {wordIntruder}.
				</p>
			</div>
		{/if}

		<div class="mb-8">
			{#if tabShuffleWord.length > 0}
				<div class="mx-auto grid max-w-2xl grid-cols-2 gap-4">
					{#each tabShuffleWord as word}
						<button
							onclick={() => sendGuess(word)}
							class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
						>
							<div
								class="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"
							></div>
							<span class="relative text-2xl font-bold tracking-wide">{word}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex gap-4">
			<button
				class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
				onclick={() => newGame()}
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
	<div class="w-80 space-y-6">
		<div class="rounded-lg bg-white p-6 shadow-sm">
			<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">📖 Règles du jeu</h4>
			<ul class="space-y-3 text-sm text-gray-600">
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Trouver le mot en déchiffrant l'annagramme</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Vous gagnez du temps ou en perdez en fonction de votre réponse</p>
				</li>
			</ul>
		</div>
		<!---
        	{#if idUser}
			<div class="rounded-lg bg-white p-6 shadow-sm">
				<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
					📊 Vos statistiques
				</h4>
				<div class="grid grid-cols-2 gap-6">
					<div class="text-center">
						<p class="text-4xl font-bold text-purple-600">{totalGamePlayed}</p>
						<p class="mt-1 text-sm text-gray-600">Parties jouées</p>
					</div>
					<div class="text-center">
						<p class="text-4xl font-bold text-blue-600">
							{Math.round(findAnagramsAverage * 100) / 100}
						</p>
						<p class="mt-1 text-sm text-gray-600">Nombre d'annagrammes trouvés en moyenne</p>
					</div>
				</div>
			</div>
		{/if}
        -->

		<div class="rounded-lg bg-white p-6 shadow-sm">
			<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">🎮 Autres jeux</h4>
			<div class="space-y-3">
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<a href="/game/pemantix">
						<h5 class="font-medium text-gray-700">🧩Pédantix</h5>
					</a>
				</div>
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<a href="/game/cemantix">
						<h5 class="font-medium text-gray-700">🧩Cémantix</h5>
					</a>
				</div>
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<a href="/game/cemantix">
						<h5 class="font-medium text-gray-700">🔗Corrélix</h5>
					</a>
				</div>
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<a href="/game/cemantix">
						<h5 class="font-medium text-gray-700">📝Motix</h5>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
