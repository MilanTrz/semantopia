<script lang="ts">
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	import { sessionStore } from '$lib/store/sessionStore';

	let nbWordCreate: number = 0;
	let isLoading: boolean = true;
	let userGuess: string = '';
	let isSurrender: boolean = false;
	const session = sessionStore.get();
	const idUser: number | null = session ? session.id : 0;
	let sessionId: string = '';
	let createWordValid: boolean;
	let tabCreateWord: string[] = [];
	let isGameOver: boolean = false;
	let interval: ReturnType<typeof setInterval> | null = null;
	let showTimeAnimation: boolean = false;
	let timeChangeValue: number = 0;
	let count = 60;
	let imposedLetters: string = '';
	let totalGamePlayed: number = 0;
	let wordCreateAverage: number = 0;

	async function newGame() {
		userGuess = '';
		nbWordCreate = 0;
		count = 60;
		isLoading = true;
		isGameOver = false;
		isSurrender = false;
		tabCreateWord = [];
		showTimeAnimation = false;
		if (interval !== null) {
			clearInterval(interval);
		}
		if (idUser === null) {
			console.error('idUser est null');
			return;
		}
		const url = `/game/panix?userId=${encodeURIComponent(idUser)}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		const data = await response.json();
		imposedLetters = data.imposedLetters;
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
	async function sendGuess() {
		if (tabCreateWord.includes(userGuess)) {
			count -= 5;
			triggerTimeAnimation(-5);
			userGuess = '';
			return null;
		}
		const response = await fetch('/game/panix', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userGuess,
				sessionId,
				action: 'sendGuess'
			})
		});

		const data = await response.json();
		createWordValid = data.isWin;
		if (createWordValid) {
			nbWordCreate++;
			tabCreateWord = [...tabCreateWord, userGuess];
			imposedLetters = data.imposedLetters;
			let time = data.winTime;
			count += time;
			triggerTimeAnimation(time);
		} else {
			count -= 5;
			triggerTimeAnimation(-5);
		}
		userGuess = '';
	}
	async function gameOver() {
		isGameOver = true;
		isSurrender = true;
		await fetch('/game/panix', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sessionId,
				idUser,
				nbEssai: nbWordCreate
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
					gameType: 'panix'
				})
			});
			const data = await response.json();
			totalGamePlayed = data.nbParties ?? 0;
			wordCreateAverage = data.nbEssaiMoyen ?? 0;
		}
	}
	async function skipLetters() {
		const response = await fetch('/game/panix', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sessionId,
				action: 'skipLetters'
			})
		});
		const data = await response.json();
		imposedLetters = data.imposedLetters;
		count -= 5;
		triggerTimeAnimation(-5);
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
				<h2 class="text-4xl font-bold text-gray-900">Panix</h2>
				<p class="mt-1 text-gray-600">
					Créer un maximum de mots en 60 secondes avec des lettres imposées collées
				</p>
				<h2 class="text-1xl font-semibold">Lettres imposées : {imposedLetters}</h2>
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
					Partie terminée, vous avez créer {nbWordCreate} mots valides.
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
			<button
				class="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
				type="submit"
				disabled={isSurrender}
				on:click={skipLetters}
			>
				Changer de lettres
			</button>
		</div>

		<div>
			{#if tabCreateWord.length > 0}
				<div class="mb-6 rounded-lg bg-white p-6 shadow-sm">
					<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
						✅ Mots valides crées ({tabCreateWord.length})
					</h4>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{#each tabCreateWord as word, index}
							<div
								class="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2"
							>
								<span class="text-sm font-medium text-green-700">#{index + 1}</span>
								<span class="font-semibold text-green-900">{word}</span>
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
					<p>Créer un maximum de mots en 60 secondes avec des lettres imposées collées</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>La longueur des lettres imposées sont de 2 à 3 lettres</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Vous gagnez du temps ou en perdez en fonction de la longueur du mots créer</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Vous ne pouvez pas mettre le meme mot que celui qu'est dans les lettres imposées</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Vous ne pouvez pas proposez plusieurs fois le même mot</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Vous pouvez changer les lettres imposées mais cela vous fera perdre 5 secondes</p>
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
						<p class="mt-1 text-sm text-gray-600">Nombre de mots créés en moyenne</p>
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
					<a href="/game/pedantix">
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
					<a href="/game/correlix">
						<h5 class="font-medium text-gray-700">🔗Corrélix</h5>
					</a>
				</div>
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<a href="/game/motix">
						<h5 class="font-medium text-gray-700">📝Motix</h5>
					</a>
				</div>
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<a href="/game/lettix">
						<h5 class="font-medium text-gray-700">📝Lettix</h5>
					</a>
				</div>
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<a href="/game/mimix">
						<h5 class="font-medium text-gray-700">📝Mimix</h5>
					</a>
				</div>
			</div>
		</div>
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
