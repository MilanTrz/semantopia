<script lang="ts">
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	import confetti from 'canvas-confetti';
	import { sessionStore } from '$lib/store/sessionStore';
	import { writable } from 'svelte/store';
	const session = sessionStore.get();
	const userId: number | null = session ? session.id : null;
	let nbEssai = 0;
	let isLoading = true;
	let userGuess = '';
	let isDisabled = false;
	let isSurrender = false;
	let isLoose = false;
	let isWin = false;
	let tabWordFind: string[] = [];
	const tabGuesses = writable<string[][]>([]);

	let nbParties: number = 0;
	let tauxReussite: number = 0;
	let nbEssaiMoyen: number = 0;

	let repbodyStats: {
		nbParties: number;
		nbEssaiMoyen: number;
		tauxReussite: number;
		serieActuelle: number;
	};

	async function newGame() {
		tabGuesses.set([]);
		isDisabled = false;
		isWin = false;
		nbEssai = 0;
		const WordLength = Math.floor(Math.random() * (8 - 5) + 5);

		try {
			const response = await fetch('/game/motix', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sizeWord: WordLength,
					userId: userId
				})
			});
			const data = await response.json();

			tabWordFind = data.tabWord;
			isLoading = false;
			isSurrender = true;
			userGuess = '';
		} catch (error) {
			return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
				status: 500
			});
		}
	}

	function sendGuess() {
		nbEssai++;
		if (nbEssai == 6) {
			isLoose = true;
			isDisabled = true;
			return null;
		}
		tabGuesses.update((g) => [
			...g,
			userGuess
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.toLowerCase()
				.split('')
		]);
		const cleanGuess = userGuess
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.split('');
		const isCorrect = cleanGuess.every((letter, i) => letter === tabWordFind[i]);
		if (isCorrect) {
			victoryGame();
			confetti();
			isDisabled = true;
			return null;
		}
		userGuess = '';
	}
	function getLetterClass(letter: string, index: number, guess: string[]) {
		if (!tabWordFind || tabWordFind.length === 0) return 'bg-gray-500 text-white';
		if (!tabWordFind.includes(letter)) {
			return 'bg-gray-500 text-white';
		}
		if (tabWordFind[index] === letter) {
			return 'bg-green-500 text-white';
		}
		return 'bg-yellow-500 text-white';
	}

	async function surrenderGame() {
		isLoose = false;
		isSurrender = false;
		isDisabled = true;
		if (userId) {
			await fetch('/game/motix', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nbEssai: nbEssai,
					isVictory: isWin,
					userId: userId
				})
			});
		}
	}
	async function victoryGame() {
		isSurrender = false;
		isWin = true;
		if (userId) {
			await fetch('/game/motix', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nbEssai: nbEssai,
					isVictory: isWin,
					userId: userId
				})
			});
		}
	}

	async function getStats() {
		if (userId) {
			const response = await fetch('/api/statistiques/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: userId,
					gameType: 'motix'
				})
			});
			repbodyStats = await response.json();
			nbParties = repbodyStats.nbParties;
			tauxReussite = repbodyStats.tauxReussite;
			nbEssaiMoyen = repbodyStats.nbEssaiMoyen;
		}
	}
	onMount(() => {
		newGame();
		getStats();
	});
</script>

<Header />
<div class="row flex min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-3xl">
		<div class="mb-6">
			<div class="mb-8">
				<h2 class="text-4xl font-bold text-gray-900">Motix</h2>
				<p class="mt-1 text-gray-600">
					En cinq essai max, trouver le mot grâce a la position des lettres des mot proposés
				</p>
				<p class="mt-2 text-sm text-gray-500">NbEssai : {nbEssai}</p>
				<p>Le mot contient {tabWordFind.length} lettres</p>
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
		{#if isLoose}
			<div
				class="flex h-40 items-center justify-center rounded-lg border-2 border-red-500 bg-red-100 p-6"
			>
				<p class="text-3xl font-bold text-red-700">
					Perdu, le mot était {tabWordFind.join('')}
				</p>
			</div>
		{/if}
		{#if isWin}
			<div
				class="flex h-40 items-center justify-center rounded-lg border-2 border-green-500 bg-green-100 p-6"
			>
				<p class="text-3xl font-bold text-green-700">
					Félicitations vous avez gagner en {nbEssai} essai
				</p>
			</div>
		{/if}

		<div class="row relative mb-6">
			<form on:submit|preventDefault={sendGuess} class="row flex">
				<input
					id="guess"
					type="text"
					bind:value={userGuess}
					placeholder="Tapez votre proposition..."
					class="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
					disabled={isDisabled}
					maxlength={tabWordFind.length}
					minlength={tabWordFind.length}
				/>
				<button
					class="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
					type="submit"
					disabled={isDisabled}
				>
					Envoyer
				</button>
			</form>
		</div>
		<div class="mb-6 rounded-lg p-6">
			<div class="space-y-2">
				{#each $tabGuesses as guess}
					<div class="flex space-x-1">
						{#each guess as letter, i}
							<div
								class={`flex h-10 w-10 items-center justify-center rounded text-xl font-bold ${getLetterClass(letter, i, guess)}`}
							>
								{letter.toUpperCase()}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>

		<div class="flex gap-4">
			{#if !isSurrender}
				<button
					class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
					on:click={newGame}
				>
					🔄 Nouvelle partie
				</button>
			{:else}
				<button
					class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
					on:click={surrenderGame}
				>
					🔄 Abandonner la Partie
				</button>
			{/if}
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
					<p>Trouver le mot mystère dont la longuer est de 5 à 8 lettres en un minimum d’essais.</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>À chaque essai, tu proposes un mot de la même longueur</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>
						Les lettres bien placées apparaissent en rouge. Les lettres présentes mais mal placées
						apparaissent en jaune. Les lettres absentes restent grises.
					</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Tu gagnes si tu trouves le mot avant d’avoir épuisé 5 essais</p>
				</li>
			</ul>
		</div>
		{#if userId}
			<div class="rounded-lg bg-white p-6 shadow-sm">
				<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
					📊 Vos statistiques
				</h4>
				<div class="grid grid-cols-2 gap-6">
					<div class="text-center">
						<p class="text-4xl font-bold text-purple-600">{nbParties}</p>
						<p class="mt-1 text-sm text-gray-600">Parties jouées</p>
					</div>
					<div class="text-center">
						<p class="text-4xl font-bold text-green-600">{tauxReussite}%</p>
						<p class="mt-1 text-sm text-gray-600">Taux de réussite</p>
					</div>
					<div class="text-center">
						<p class="text-4xl font-bold text-blue-600">{nbEssaiMoyen}</p>
						<p class="mt-1 text-sm text-gray-600">Essais moyen</p>
					</div>
					<div class="text-center">
						<p class="text-4xl font-bold text-orange-600"></p>
						<p class="mt-1 text-sm text-gray-600">Série actuelle</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="rounded-lg bg-white p-6 shadow-sm">
			<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">🎮 Autres jeux</h4>
			<div class="space-y-3">
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
					<a href="/game/correlix">
						<h5 class="font-medium text-gray-700">🔗Corrélix</h5>
					</a>
				</div>
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<a href="/game/pedantix">
						<h5 class="font-medium text-gray-700">📝Pédantix</h5>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
