<script lang="ts">
	import Header from '$lib/header.svelte';
	import OtherGames from '$lib/OtherGames.svelte';
	import { onMount } from 'svelte';
	import { triggerConfettiAnimation } from '$lib';
	import { sessionStore } from '$lib/store/sessionStore';
	import { writable } from 'svelte/store';

	let letters = 'AZERTYUIOPQSDFGHJKLMWXCVBN'.split('');
	$: letterColors =
		$tabGuesses.length > 0
			? letters.map((letter) => getKeyboardLetterColor(letter))
			: Array(letters.length).fill('bg-gray-300 text-black');
	const session = sessionStore.get();
	const userId: number | null = session ? session.id : null;
	let nbEssai = 0;
	let isLoading = true;
	let userGuess = '';
	let isDisabled = false;
	let isSurrender = false;
	let isLoose = false;
	let isWin = false;
	let isWordExist = true;
	let tabWordFind: string[] = [];
	let categorieWord: string = '';
	let similarWord: string = '';
	const tabGuesses = writable<string[][]>([]);

	let revealedIndice = [false, false, false];

	function toggleReveal(index: number) {
		revealedIndice[index] = !revealedIndice[index];
	}

	let nbParties: number = 0;
	let tauxReussite: number = 0;
	let nbEssaiMoyen: number = 0;
	let serieActuelle: number = 0;

	let repbodyStats: {
		nbParties: number;
		nbEssaiMoyen: number;
		tauxReussite: number;
		serieActuelle: number;
	};

	async function newGame() {
		revealedIndice = [false, false, false];
		tabGuesses.set([]);
		isDisabled = false;
		isWin = false;
		nbEssai = 0;
		isLoose = false;
		isLoading = true;
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
			categorieWord = data.findCategorie;
			similarWord = data.similarWord;
			isLoading = false;
			isSurrender = true;
			userGuess = '';
		} catch (error) {
			return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
				status: 500
			});
		}
	}

	async function sendGuess() {
		isWordExist = true;
		try {
			const response = await fetch('http://localhost:5000/api/check-word', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					word: userGuess
				})
			});
			const data = await response.json();
			if (!data.exists) {
				isWordExist = false;
				return null;
			}
		} catch (error) {
			return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
				status: 500
			});
		}

		nbEssai++;
		tabGuesses.update((g) => [
			...g,
			userGuess
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.toLowerCase()
				.split('')
		]);
		letterColors = letters.map((letter) => getKeyboardLetterColor(letter));
		const cleanGuess = userGuess
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.split('');
		const isCorrect = cleanGuess.every((letter, i) => letter === tabWordFind[i]);
		if (isCorrect) {
			victoryGame();
			triggerConfettiAnimation();
			isDisabled = true;
			return null;
		}
		if (nbEssai == 5) {
			isLoose = true;
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

		const countInWord = tabWordFind.filter((l) => l === letter).length;

		const countGreen = guess.filter((l, i) => l === letter && tabWordFind[i] === letter).length;

		const countYellowBefore = guess
			.slice(0, index)
			.filter((l, i) => l === letter && tabWordFind[i] !== letter).length;

		if (countGreen + countYellowBefore >= countInWord) {
			return 'bg-gray-500 text-white';
		}

		return 'bg-yellow-500 text-white';
	}

	async function surrenderGame() {
		isLoose = true;
		isSurrender = false;
		isDisabled = true;
		if (userId) {
			await fetch('/game/motix', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nbEssai: nbEssai,
					isVictory: isWin,
					idUser: userId
				})
			});
			getStats();
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
					idUser: userId
				})
			});
			getStats();
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
			nbParties = repbodyStats.nbParties ?? 0;
			tauxReussite = repbodyStats.tauxReussite ?? 0;
			nbEssaiMoyen = repbodyStats.nbEssaiMoyen ?? 0;
			serieActuelle = repbodyStats.serieActuelle ?? 0;
		}
	}

	function getKeyboardLetterColor(letter: string) {
		let bestColor = 'bg-gray-300 text-black';
		const normalizedLetter = letter.toLowerCase();
		$tabGuesses.forEach((guess) => {
			guess.forEach((guessLetter, index) => {
				if (guessLetter !== normalizedLetter) return;

				if (tabWordFind[index] === normalizedLetter) {
					bestColor = 'bg-green-500 text-white';
				} else if (tabWordFind.includes(normalizedLetter) && !bestColor.includes('bg-green-500')) {
					bestColor = 'bg-yellow-500 text-white';
				} else if (
					!tabWordFind.includes(normalizedLetter) &&
					bestColor === 'bg-gray-300 text-black'
				) {
					bestColor = 'bg-gray-500 text-white';
				}
			});
		});

		return bestColor;
	}

	onMount(() => {
		newGame();
		getStats();
	});
</script>

<Header />

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-7xl flex gap-12">
		<div class="flex-1 max-w-3xl">
		<div class="mb-6">
			<div class="mb-8">
				<h1 class="text-4xl font-bold text-gray-900 mb-2">
					<i class="fa-solid fa-keyboard text-emerald-600 mr-3" aria-hidden="true"></i>
					Motix
				</h1>
				<p class="mt-1 text-gray-600">
					En cinq essais maximum, trouver le mot grâce à la position des lettres des mots proposés
				</p>
				<p class="mt-2 text-sm text-gray-500">Essais : {nbEssai}</p>
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
					Félicitations vous avez gagner en {nbEssai} essais
				</p>
			</div>
		{/if}
		{#if !isWordExist}
			<div class="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-6">
				<svg
					class="h-6 w-6 flex-shrink-0 text-amber-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<div>
					<p class="font-semibold text-amber-900">Mot introuvable</p>
					<p class="text-sm text-amber-700">Ce mot n'existe pas dans notre vocabulaire</p>
				</div>
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
		<div class="mx-auto mt-16 mb-12 flex max-w-2xl flex-wrap justify-center gap-2">
			{#each letters as letter, i}
				<div
					class="flex h-12 w-15 cursor-pointer items-center justify-center rounded select-none {letterColors[
						i
					]}"
				>
					{letter}
				</div>
			{/each}
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
	<div class="w-80 shrink-0 space-y-6">
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

		<div class="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
			<div class="w-full max-w-md">
				<div class="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
					<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Indices Mystère</h2>

					<div class="space-y-4">
						{#if !revealedIndice[0]}
							<button
								on:click={() => toggleReveal(0)}
								class="w-full rounded-lg border-2 border-black bg-white px-6 py-3 font-semibold text-black transition-all duration-200 hover:bg-gray-50 hover:shadow-md active:bg-gray-100"
							>
								Premier Indice
							</button>
						{:else}
							<div class="w-full rounded-lg border-2 border-black bg-gray-50 p-4">
								<h4>Catégorie du mot :</h4>
								<p class="text-gray-800">{categorieWord}</p>
							</div>
						{/if}
						{#if !revealedIndice[1]}
							<button
								on:click={() => toggleReveal(1)}
								class="w-full rounded-lg border-2 border-black bg-white px-6 py-3 font-semibold text-black transition-all duration-200 hover:bg-gray-50 hover:shadow-md active:bg-gray-100"
							>
								Deuxième Indice
							</button>
						{:else}
							<div class="w-full rounded-lg border-2 border-black bg-gray-50 p-4">
								<h4>Premier lettre du mot :</h4>
								<p class="text-gray-800">{tabWordFind[0]}</p>
							</div>
						{/if}
						{#if !revealedIndice[2]}
							<button
								on:click={() => toggleReveal(2)}
								class="w-full rounded-lg border-2 border-black bg-white px-6 py-3 font-semibold text-black transition-all duration-200 hover:bg-gray-50 hover:shadow-md active:bg-gray-100"
							>
								Troisième Indice
							</button>
						{:else}
							<div class="w-full rounded-lg border-2 border-black bg-gray-50 p-4">
								<h4>Mot similaire</h4>
								<p class="text-gray-800">{similarWord}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
		{#if userId}
			<div class="rounded-lg bg-white p-6 shadow-sm">
				<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
					📊 Vos statistiques
				</h4>
				<div class="grid grid-cols-2 gap-6">
					<div class="text-center">
					<p class="text-4xl font-bold text-emerald-600">{nbParties}</p>
					<p class="mt-1 text-sm text-gray-600">Parties jouées</p>
				</div>
				<div class="text-center">
					<p class="text-4xl font-bold text-green-600">{Math.round(tauxReussite * 100)}%</p>
					<p class="mt-1 text-sm text-gray-600">Taux de réussite</p>
				</div>
				<div class="text-center">
					<p class="text-4xl font-bold text-lime-600">{Math.round(nbEssaiMoyen * 100) / 100}</p>
					<p class="mt-1 text-sm text-gray-600">Essais moyen</p>
				</div>
				<div class="text-center">
					<p class="text-4xl font-bold text-green-500">{serieActuelle}</p>
					<p class="mt-1 text-sm text-gray-600">Série actuelle</p>
				</div>
			</div>
		</div>
	{/if}

	<OtherGames exclude="motix" />
</div>
</div>
</div>