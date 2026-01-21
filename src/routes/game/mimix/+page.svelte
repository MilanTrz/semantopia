<script lang="ts">
	import Header from '$lib/header.svelte';
	import OtherGames from '$lib/OtherGames.svelte';
	import { onMount } from 'svelte';
	import { sessionStore } from '$lib/store/sessionStore';
	import { emitGameEvent } from '$lib/store/gameEventStore';
	import type { GameEventData } from '$lib/models/achievements';
	let nbIntruderFind: number = 0;
	let isLoading: boolean = true;
	const session = sessionStore.get();
	const idUser: number | null = session ? session.id : 0;
	let sessionId: string = '';
	let isGameOver: boolean = false;
	let tabShuffleWord: string[] = [];
	let wordIntruder: string = '';
	let foundIntruder: boolean;
	let totalGamePlayed: number = 0;
	let averageWordFind: number = 0;
	let maxWordFind: number = 0;
	let disabledButton: boolean = true;
	let isGuessing: boolean = false;

	async function newGame() {
		isLoading = true;
		isGameOver = false;
		disabledButton = true;
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
		if (isGuessing) return;
		isGuessing = true;
		try {
			const response = await fetch('/game/mimix', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					word,
					sessionId
				})
			});

			const data = await response.json();
			foundIntruder = data.isWin;
			if (foundIntruder) {
				nbIntruderFind++;
				tabShuffleWord = data.newTabShuffleWord;
			} else {
				gameOver();
			}
		} finally {
			isGuessing = false;
		}
	}
	async function gameOver() {
		isGameOver = true;
		disabledButton = false;
		const response = await fetch('/game/mimix', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				idUser,
				score: nbIntruderFind,
				sessionId
			})
		});
		const data = await response.json();
		wordIntruder = data.wordIntruder;

		const eventData: GameEventData = {
			userId: idUser ?? 0,
			type: 'mimix',
			score: nbIntruderFind
		};
		emitGameEvent(eventData);
	}
	async function getStats() {
		if (idUser) {
			const response = await fetch('/api/statistiques/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: idUser,
					gameType: 'mimix'
				})
			});
			const data = await response.json();
			totalGamePlayed = data.nbParties ?? 0;
			averageWordFind = data.scoreMoyen ?? 0;
			maxWordFind = data.scoreMax ?? 0;
		}
	}

	onMount(() => {
		newGame();
		getStats();
	});
</script>

<Header />
<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto flex max-w-7xl gap-12">
		<div class="max-w-3xl flex-1">
			<div class="mb-6">
				<div class="mb-8">
					<h1 class="mb-2 text-4xl font-bold text-gray-900">
						<i class="fa-solid fa-question mr-3 text-rose-700" aria-hidden="true"></i>
						Mimix
					</h1>
					<p class="mt-1 text-gray-600">
						Trouvez le plus de fois l'intrus parmi les 4 propositions
					</p>
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
					class="mb-12 flex h-40 items-center justify-center rounded-lg border-2 border-red-500 bg-red-100 p-6"
				>
					<p class="text-3xl font-bold text-red-700">
						Partie terminée, vous avez deviné {nbIntruderFind} intrus. Le dernier intrus était {wordIntruder}.
					</p>
				</div>
			{/if}

			<div class="mb-8">
				{#if tabShuffleWord.length > 0}
					<div class="mx-auto grid max-w-2xl grid-cols-2 gap-4">
						{#if !isLoading}
							{#each tabShuffleWord as word}
								<button
									onclick={() => sendGuess(word)}
									class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-700 via-red-500 to-orange-300 p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isGameOver || isGuessing}
								>
									<div
										class="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"
									></div>
									<span class="relative text-2xl font-bold tracking-wide">{word}</span>
								</button>
							{/each}
						{/if}
					</div>
				{/if}
			</div>

			<div class="flex gap-4">
				{#if !isGameOver}
					<button
						class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
						onclick={() => {isGameOver = true; gameOver();}}
						disabled={isGameOver}
					>
						🏳️ Abandonner
					</button>
				{:else}
					<button
						class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
						onclick={() => newGame()}
					>
						🔄 Nouvelle partie
					</button>
					<button
						class="flex-1 rounded-lg bg-gradient-to-r from-rose-700 via-red-500 to-orange-300 px-6 py-3 font-medium text-white transition hover:shadow-lg"
					>
						📤 Partager résultat
					</button>
				{/if}
			</div>
		</div>

		<div class="w-80 shrink-0 space-y-6">
			<div class="rounded-lg bg-white p-6 shadow-sm">
				<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">📖 Règles du jeu</h4>
				<ul class="space-y-3 text-sm text-gray-600">
					<li class="flex items-start">
						<span class="mr-2">•</span>
						<p>Trouvez le plus de fois l'intrus parmi les 4 propositions</p>
					</li>
					<li class="flex items-start">
						<span class="mr-2">•</span>
						<p>Au fur et à mesure les mots sont de moins en moins proches</p>
					</li>
				</ul>
			</div>
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
								{Math.round(averageWordFind * 100) / 100}
							</p>
							<p class="mt-1 text-sm text-gray-600">Nombre de mots créés en moyenne</p>
						</div>
						<div class="text-center">
							<p class="text-4xl font-bold text-blue-600">
								{maxWordFind}
							</p>
							<p class="mt-1 text-sm text-gray-600">Nombre de mots créés le plus</p>
						</div>
					</div>
				</div>
			{/if}

			<OtherGames exclude="mimix" />
		</div>
	</div>
</div>
