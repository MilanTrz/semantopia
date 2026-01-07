<script lang="ts">
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	import { sessionStore } from '$lib/store/sessionStore';
import OtherGames from '$lib/OtherGames.svelte';


	let nbWordCreate: number = 0;
	let isLoading: boolean = true;
	let userGuess: string = '';
	let isSurrender: boolean = false;
	const session = sessionStore.get();
	const idUser: number | null = session ? session.id : 0;
	let sessionId: string = '';
	let isWordValid: boolean;
	let chainWords: string[] = [];
	let guessedWords: Set<string> = new Set();
	let isGameOver: boolean = false;
	let interval: ReturnType<typeof setInterval> | null = null;
	let showTimeAnimation: boolean = false;
	let timeChangeValue: number = 0;
	let count = 60;
	let startingWord: string = '';
    let totalGamePlayed:number = 0;
    let wordCreateAverage:number = 0;

	async function newGame() {
		userGuess = '';
		nbWordCreate = 0;
		count = 60;
		isLoading = true;
		isGameOver = false;
		isSurrender = false;
		chainWords = [];
		guessedWords = new Set();
		showTimeAnimation = false;
		if (interval !== null) {
			clearInterval(interval);
		}
		if (idUser === null) {
			console.error('idUser est null');
			return;
		}
		const url = `/game/chainix?userId=${encodeURIComponent(idUser)}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		const data = await response.json();
		startingWord = data.startingWord;
		chainWords = [startingWord];
		sessionId = data.sessionId;
		isLoading = false;

		interval = setInterval(() => {
			count--;
			if (count <= 0) {
				if (interval !== null) {
					clearInterval(interval);
					interval = null;
				}
				gameOver();
			}
		}, 1000);
	}
	const normalizeWord = (word: string) =>
		word
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.trim()
			.toLowerCase();

	async function sendGuess() {
		const cleanGuess = userGuess.trim();
		if (!cleanGuess) return;

		const normalizedGuess = normalizeWord(cleanGuess);
		if (guessedWords.has(normalizedGuess)) {
			count -= 5;
			triggerTimeAnimation(-5);
			userGuess = '';
			return null;
		}
		const response = await fetch('/game/chainix', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userGuess: cleanGuess,
				sessionId,
				currentLastWord: chainWords[chainWords.length - 1]
			})
		});

		const data = await response.json();
		isWordValid = data.isValid;
		if (isWordValid) {
			nbWordCreate++;
			chainWords = [...chainWords, cleanGuess];
			guessedWords.add(normalizedGuess);
			let timeBonus = data.timeBonus;
			count += timeBonus;
			triggerTimeAnimation(timeBonus);
		} else {
			count -= 5;
			triggerTimeAnimation(-5);
		}
		userGuess = '';
	}
	async function gameOver() {
		isGameOver = true;
		isSurrender = true;
		await fetch('/game/chainix', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sessionId,
                idUser,
                chainLength: chainWords.length - 1
			})
		});
	}

	function triggerTimeAnimation(value: number) {
		timeChangeValue = value;
		showTimeAnimation = true;
		setTimeout(() => {
			showTimeAnimation = false;
		}, 1000);
	}
    async function getStats() {
		if (idUser) {
			const response = await fetch('/api/statistiques/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: idUser,
					gameType: 'chainix'
				})
			});
			const data = await response.json();
			totalGamePlayed= data.nbParties ?? 0;
			wordCreateAverage = data.nbEssaiMoyen ?? 0;

		}
	}

	onMount(() => {
		newGame();
        getStats();
	});
</script>

<Header />
<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-7xl flex gap-12">
		<!-- Contenu principal -->
		<div class="flex-1 max-w-3xl">
		<div class="mb-6">
			<div class="mb-8">
				<h2 class="text-4xl font-bold text-gray-900">Chainix</h2>
				<p class="mt-1 text-gray-600">
					Créer la plus longue chaîne en 60 secondes. Chaque fin de mot devient le début du suivant.
				</p>
				<h2 class="text-1xl font-semibold">Mot actuel : <span class="text-purple-600">{chainWords[chainWords.length - 1]}</span></h2>
				{#if !isGameOver}
					<div class="flex items-center gap-4">
						<h2 class="text-1xl font-semibold">Temps restants : {count}</h2>
						{#if showTimeAnimation}
							<span
								class="animate-bounce-up text-3xl font-bold {timeChangeValue > 0
									? 'text-green-600'
									: 'text-red-600'}"
							>
								{timeChangeValue > 0 ? '+' : ''}{timeChangeValue}s
							</span>
						{/if}
					</div>
				{/if}
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
					Partie terminée, chaîne de {chainWords.length - 1} mots.
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
					disabled={isSurrender}
				/>
				<button
					class="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
					type="submit"
					disabled={isSurrender}
				>
					Envoyer
				</button>
			</form>
		</div>
		

		<div>
			{#if chainWords.length > 1}
				<div class="mb-6 rounded-lg bg-white p-6 shadow-sm">
					<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
						✅ Chaîne de mots ({chainWords.length - 1})
					</h4>
					<div class="flex flex-wrap items-center gap-2">
						{#each chainWords as word, index}
							<div class="flex items-center gap-2">
								<div class="rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 font-semibold text-purple-900">
									{word}
								</div>
								{#if index < chainWords.length - 1}
									<span class="text-lg font-bold text-purple-600">→</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
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
	<div class="w-80 space-y-6">
		<div class="rounded-lg bg-white p-6 shadow-sm">
			<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">📖 Règles du jeu</h4>
			<ul class="space-y-3 text-sm text-gray-600">
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Créer la plus longue chaîne de mots en 60 secondes</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Chaque mot doit commencer par les 2 ou 3 dernières lettres du mot précédent</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Les mots doivent exister dans le dictionnaire</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Vous gagnez du temps (2-4s) pour chaque mot trouvé</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Vous perdez 5 secondes pour chaque mot invalide</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Vous ne pouvez pas utiliser deux fois le même mot</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Chaque partie démarre avec un nouveau mot de départ</p>
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
							{Math.round(wordCreateAverage * 100) / 100}
						</p>
						<p class="mt-1 text-sm text-gray-600">Longueur moyenne de la chaîne</p>
					</div>
				</div>
			</div>
		{/if}
      

		<OtherGames exclude="chainix" />
	</div>
</div>

<style>
	@keyframes bounce-up {
		0% {
			opacity: 0;
			transform: translateY(0);
		}
		50% {
			opacity: 1;
			transform: translateY(-20px);
		}
		100% {
			opacity: 0;
			transform: translateY(-40px);
		}
	}

	.animate-bounce-up {
		animation: bounce-up 1s ease-out;
	}
</style>
