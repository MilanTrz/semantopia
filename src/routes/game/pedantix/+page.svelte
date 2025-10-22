<script lang="ts">
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	import confetti from 'canvas-confetti';

	let userGuess = '';
	let tabguess: string[] = [];
	let repbody: {
		tabHiddenTitle: number[];
		tabHiddenContent: number[];
	};
	let tabTitle: number[];
	let tabContent: number[];
	let nbEssai: number = 0;

	let partiesJouees: number = 0;
	let tauxReussite: string = '0%';
	let essaisMoyen: number = 0.0;
	let serieActuelle: number = 0;

	let isLoading = true;
	let isVictory = false;


	async function newGame() {
		nbEssai = 0;
		tabguess = [];
		isLoading = true;
		isVictory = false;
		userGuess = '';
		try{
	
		const response = await fetch('/game/pedantix/', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		repbody = await response.json();
		if (response.status == 201) {
			tabTitle = repbody.tabHiddenTitle;
			tabContent = repbody.tabHiddenContent;
		}
	}catch (error) {
			console.error('Erreur de chargement:', error);
		} finally {
			isLoading = false; 
		}
	}

	async function sendGuess() {
		nbEssai++;
		tabguess.push(userGuess);
		tabguess = tabguess;
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
		if (tabTitle.every(item => typeof item === 'string')){
			triggerVictory();
		}
		userGuess = '';
	}

	function triggerVictory(){
	isVictory = true;
	const duration = 4 * 1000; // 
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.5,
        },
        colors: ['#bb0000', '#ffffff', '#ffcc00', '#00bbff'],
      });
    }, 250);
  
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
				<h2 class="text-4xl font-bold text-gray-900">Pédantix</h2>
				<p class="mt-1 text-gray-600">Trouvez le mot mystère grâce à la proximité sémantique</p>
				<p class="mt-2 text-sm text-gray-500">NbEssai : {nbEssai}</p>
			</div>
		</div>
		{#if isLoading}
		<div class="flex flex-col items-center justify-center py-12">
			<div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
			<p class="text-gray-600 font-medium">Chargement de la partie...</p>
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
				{#each tabTitle as item}
					{#if typeof item === 'number'}
						<span class="group relative inline-block cursor-help">
							 {Array(item).fill('■').join('')}
							<span
								class="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								{item}
							</span>
						</span>{' '}
					{:else}
						{item}{' '}
					{/if}
				{/each}
			</p>
			<p class="w-full tracking-wide focus:outline-none">
				{#each tabContent as item}
					{#if typeof item === 'number'}
						<span class="group relative inline-block cursor-help">
							 {Array(item).fill('■').join('')}
							<span
								class="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								{item}
							</span>
						</span>{' '}
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
					<p class="text-4xl font-bold text-green-600">{tauxReussite}</p>
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

		<div class="rounded-lg bg-white p-6 shadow-sm">
			<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">🎮 Autres jeux</h4>
			<div class="space-y-3">
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<span class="mr-3 text-xl">🧩</span>
					<h5 class="font-medium text-gray-700">Cémantix</h5>
				</div>
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<span class="mr-3 text-xl">🔗</span>
					<h5 class="font-medium text-gray-700">Corrélix</h5>
				</div>
				<div
					class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
				>
					<span class="mr-3 text-xl">📝</span>
					<h5 class="font-medium text-gray-700">Motix</h5>
				</div>
			</div>
		</div>
	</div>
</div>
