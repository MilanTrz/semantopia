<script lang="ts">
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	import { triggerConfettiAnimation } from '$lib';
	import { sessionStore } from '$lib/store/sessionStore';
	import type { challenge } from '$lib/models/challenge';
	import type { hints } from '$lib/models/hints';

	let userGuess = '';
	let tabguess: string[] = [];
	let sessionId: string = '';
	let repbody: {
		sessionId: string;
		tabHiddenTitle: number[];
		tabHiddenContent: number[];
		hints: hints;
		isWordInGame: boolean;
	};

	let repbodyStats: {
		nbParties: number;
		nbEssaiMoyen: number;
		tauxReussite: number;
		serieActuelle: number;
	};
	let tabTitle: number[];
	let tabTitleTemp: number[] = [];
	let tabContent: number[];
	let tabContentTemp: number[] = [];
	let nbEssai: number = 0;

	let partiesJouees: number = 0;
	let tauxReussite: number = 0;
	let essaisMoyen: number = 0.0;
	let serieActuelle: number = 0;

	let isLoading = true;
	let isVictory = false;

	let isSurrender = true;

	const session = sessionStore.get();
	const idUser: number | null = session ? session.id : 0;

	let lastChallenge: challenge | null = null;
	let userHintReaveal: number = 0;

	let hintsGame: hints;
	let revealedIndice = [false, false, false];

	let isWordInGame: boolean = true;
	let isChallengeWinned: boolean = false;

	function toggleReveal(index: number) {
		revealedIndice[index] = !revealedIndice[index];
	}
	function resetIndices() {
		revealedIndice = [false, false, false];
	}

	async function newGame() {
		if (idUser) {
			getStatistics();
		}
		resetIndices();
		isChallengeWinned = false;
		isSurrender = true;
		tabguess = [];
		isLoading = true;
		isVictory = false;
		nbEssai = 0;
		userGuess = '';
		if (idUser === null) {
			console.error('idUser est null');
			return;
		}
		const url = `/game/pedantix?userId=${encodeURIComponent(idUser)}`;
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});
			repbody = await response.json();
			if (response.status == 201) {
				sessionId = repbody.sessionId;
				tabTitle = repbody.tabHiddenTitle;
				tabContent = repbody.tabHiddenContent;
				hintsGame = repbody.hints;
			}
		} catch (error) {
			console.error('Erreur de chargement:', error);
		} finally {
			isLoading = false;
		}
	}

	async function sendGuess() {
		isWordInGame = true;
		nbEssai++;
		tabguess.push(userGuess);
		tabguess = tabguess;
		const response = await fetch('/game/pedantix/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userGuess,
				sessionId
			})
		});
		repbody = await response.json();
		if (response.status == 201) {
			tabTitleTemp = tabTitle;
			tabContentTemp = tabContent;
			tabTitle = repbody.tabHiddenTitle;
			tabContent = repbody.tabHiddenContent;
			isWordInGame = repbody.isWordInGame;
		}
		isWordInGame = repbody.isWordInGame;
		if (tabTitle.every((item) => typeof item === 'string')) {
			triggerVictory();
		}
		userGuess = '';
	}

	function isNewlyFoundTitle(index: number): boolean {
		return (
			typeof tabTitleTemp[index] === 'number' &&
			typeof tabTitle[index] === 'string' &&
			!/^[.,!?;:()\[\]{}"'«»\-–—]$/.test(tabTitle[index] as string)
		);
	}
	function isNewlyFoundContent(index: number): boolean {
		return (
			typeof tabContentTemp[index] === 'number' &&
			typeof tabContent[index] === 'string' &&
			!/^[.,!?;:()\[\]{}"'«»\-–—]$/.test(tabContent[index] as string)
		);
	}

	async function triggerVictory() {
		isVictory = true;
		isSurrender = false;
		try {
			if (idUser) {
				await fetch('/game/pedantix', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						nbEssai,
						isVictory,
						idUser
					})
				});

				if (lastChallenge) {
					if (lastChallenge.nbTry > 0) {
						if (nbEssai < lastChallenge.nbTry) {
							isChallengeWinned = true;
							winChallenge();
						}
					} else if (lastChallenge.nbHint >= 0) {
						if (userHintReaveal < lastChallenge.nbHint) {
							isChallengeWinned = true;
							winChallenge();
						}
					}
				}
			}
		} catch (error) {
			console.error('Erreur Server:', error);
			throw error;
		}
		triggerConfettiAnimation();
	}

	async function surrenderGame() {
		isSurrender = false;
		isVictory = false;
		try {
			if (idUser) {
				await fetch('/game/pedantix', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						nbEssai,
						isVictory,
						idUser
					})
				});
			}
		} catch (error) {
			console.error('Erreur Server:', error);
			throw error;
		}
	}
	async function getStatistics() {
		try {
			const responseStats: Response = await fetch('/api/statistiques', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: idUser,
					gameType: 'pedantix'
				})
			});
			repbodyStats = await responseStats.json();
			partiesJouees = repbodyStats.nbParties ?? 0;
			tauxReussite = repbodyStats.tauxReussite ?? 0;
			essaisMoyen = repbodyStats.nbEssaiMoyen ?? 0;
			serieActuelle = repbodyStats.serieActuelle ?? 0;
		} catch (error) {
			console.error('Erreur Server:', error);
			throw error;
		}
	}
	async function checkChallenge() {
		try {
			const response = await fetch('/api/challenge/checkChallenge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					gameName: 'pedantix'
				})
			});
			const data = await response.json();
			if (data) {
				lastChallenge = data.lastChallenge;
			}
		} catch (error) {
			console.error('Erreur Server:', error);
			throw error;
		}
	}
	async function winChallenge() {
		try {
			await fetch('/api/challenge/updateWinChallenge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					idUser: idUser
				})
			});
		} catch (error) {
			console.error('Erreur Server:', error);
			throw error;
		}
	}

	onMount(() => {
		newGame();
		checkChallenge();
	});
</script>

<Header />
<div class="row flex min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-3xl">
		<div class="mb-6">
			<div class="mb-8">
				<h2 class="text-4xl font-bold text-gray-900">Pédantix</h2>
				<p class="mt-1 text-gray-600">Trouvez le mot mystère grâce à la proximité sémantique</p>
				<p class="mt-2 text-sm text-gray-500">NbEssai : {nbEssai}</p>
			</div>
		</div>
		{#if isChallengeWinned}
			<div class="mb-6 flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-6">
				<svg
					class="h-6 w-6 flex-shrink-0 text-green-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div>
					<p class="font-semibold text-green-900">Défi relevé !</p>
					<p class="text-sm text-green-700">
						Félicitations, vous avez réussi le défi d'aujourd'hui de Pédantix !
					</p>
				</div>
			</div>
		{/if}
		{#if isLoading}
			<div class="flex flex-col items-center justify-center py-12">
				<div
					class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"
				></div>
				<p class="font-medium text-gray-600">Chargement de la partie...</p>
			</div>
		{/if}
		{#if !isWordInGame}
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
					<p class="text-sm text-amber-700">
						Ce mot n'existe pas dans notre vocabulaire ou n'est pas présent dans le jeu
					</p>
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
					disabled={isVictory}
				/>
				<button
					class="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
					type="submit"
					disabled={isVictory}
				>
					Envoyer
				</button>
			</form>
		</div>
		<div class="mb-6 rounded-lg p-6">
			<p class="mb-4 text-sm tracking-wide text-gray-600">
				{#each tabTitle as item, i}
					{#if typeof item === 'number'}
						<span class="group relative inline-block cursor-help">
							{Array(item).fill('■').join('')}
							<span
								class="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								{item}{' '}
							</span>
						</span>{' '}
					{:else}
						<span
							class="inline-block"
							class:text-green-600={isNewlyFoundTitle(i)}
							class:bg-green-100={isNewlyFoundTitle(i)}
							class:border-2={isNewlyFoundTitle(i)}
							class:border-green-500={isNewlyFoundTitle(i)}
							class:rounded={isNewlyFoundTitle(i)}
							class:px-1={isNewlyFoundTitle(i)}
						>
							{item}{' '}
						</span>
					{/if}
				{/each}
			</p>
			<p class="w-full tracking-wide focus:outline-none">
				{#each tabContent as item, i}
					{#if typeof item === 'number'}
						<span class="group relative inline-block cursor-help">
							{Array(item).fill('■').join('')}
							<span
								class="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								{item}{' '}
							</span>
						</span>{' '}
					{:else}
						<span
							class="inline-block"
							class:text-green-600={isNewlyFoundContent(i)}
							class:bg-green-100={isNewlyFoundContent(i)}
							class:border-2={isNewlyFoundContent(i)}
							class:border-green-500={isNewlyFoundContent(i)}
							class:rounded={isNewlyFoundContent(i)}
							class:px-1={isNewlyFoundContent(i)}
						>
							{item}{' '}
						</span>{' '}
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
					<p>Trouvez le mot mystère en vous aidant de la proximité sémantique</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Plus votre proposition est proche du mot, plus le pourcentage est élevé</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Chaque bonne proposition révèle des mots dans l'extrait Wikipedia</p>
				</li>
				<li class="flex items-start">
					<span class="mr-2">•</span>
					<p>Utilisez les indices pour vous rapprocher du mot cible</p>
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
								<h4>Catégorie de la page Wikipedia :</h4>
								<p class="text-gray-800">{hintsGame.categories[0]}</p>
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
								<h4>Lien qui appartient a la page:</h4>
								<p class="text-gray-800">{hintsGame.links}</p>
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
								<h4>Intro sans le titre de la page :</h4>
								<p class="text-gray-800">{hintsGame.intro}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
		{#if idUser}
			<div class="rounded-lg bg-white p-6 shadow-sm">
				<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
					📊 Vos statistiques
				</h4>
				<div class="grid grid-cols-2 gap-6">
					<div class="text-center">
						<p class="text-4xl font-bold text-purple-600">{partiesJouees}</p>
						<p class="mt-1 text-sm text-gray-600">Parties jouées</p>
					</div>
					<div class="text-center">
						<p class="text-4xl font-bold text-green-600">{tauxReussite}%</p>
						<p class="mt-1 text-sm text-gray-600">Taux de réussite</p>
					</div>
					<div class="text-center">
						<p class="text-4xl font-bold text-blue-600">{essaisMoyen}</p>
						<p class="mt-1 text-sm text-gray-600">Essais moyen</p>
					</div>
					<div class="text-center">
						<p class="text-4xl font-bold text-orange-600">{serieActuelle}</p>
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
