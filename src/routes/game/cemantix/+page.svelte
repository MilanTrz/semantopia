<script lang="ts">
	import Header from '$lib/header.svelte';
	import { triggerConfettiAnimation } from '$lib';
	
	let userGuess = '';
	let guesses: {
		word: string;
		similarity: number | false;
		attemptNumber: number;
		rank?: number;
	}[] = [];
	let nbEssai = 0;
	let gameWon = false;
	let targetWord = '';
	let wordLength = 0;
	let message = '';

	async function newGame() {
		nbEssai = 0;
		guesses = [];
		gameWon = false;
		targetWord = '';
		userGuess = '';
		message = '';

		try {
			const response = await fetch('/game/cemantix/', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await response.json();
			if (response.status === 201) {
				wordLength = data.wordLength;
				message = 'Nouvelle partie créée ! Trouvez le mot mystère.';
			}
		} catch (error) {
			message = 'Erreur lors de la création de la partie.';
			console.error(error);
		}
	}

	async function sendGuess() {
		if (!userGuess.trim()) {
			return;
		}

		const wordToCheck = userGuess.trim().toLowerCase();
		const alreadyGuessed = guesses.some((g) => g.word.toLowerCase() === wordToCheck);

		if (alreadyGuessed) {
			message = `⚠️ Vous avez déjà essayé le mot "${userGuess.trim()}".`;
			userGuess = '';
			return;
		}

		nbEssai++;

		try {
			const response = await fetch('/game/cemantix/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userGuess: userGuess.trim() })
			});

			const data = await response.json();

			if (response.status === 201) {
				if (data.notInVocabulary) {
					message = `❌ Le mot "${userGuess.trim()}" n'existe pas dans le vocabulaire.`;
					nbEssai--;
				} else if (data.error || data.similarity === null) {
					message = `⚠️ Erreur lors du calcul de similarité pour "${userGuess.trim()}".`;
					nbEssai--;
				} else {
					guesses = data.guesses;

					if (data.isWinner) {
						gameWon = true;
						targetWord = data.targetWord;
						message = `🎉 Félicitations ! Vous avez trouvé le mot "${targetWord}" en ${nbEssai} essais !`;
						triggerConfettiAnimation();
					} else {
						message = `Proximité de ${userGuess.trim()}: ${data.similarity.toFixed(2)}%`;
					}
				}
			}
		} catch (error) {
			message = "Erreur lors de l'envoi de votre proposition.";
			console.error(error);
		}

		userGuess = '';
	}

	function getSimilarityColor(similarity: number): string {
		if (similarity >= 50) return 'bg-green-100 border-green-400 text-green-800';
		if (similarity >= 35) return 'bg-lime-100 border-lime-400 text-lime-800';
		if (similarity >= 20) return 'bg-yellow-100 border-yellow-400 text-yellow-800';
		if (similarity >= 10) return 'bg-orange-100 border-orange-400 text-orange-800';
		if (similarity >= 0) return 'bg-red-100 border-red-400 text-red-800';
		return 'bg-blue-100 border-blue-400 text-blue-800';
	}

	function getSimilarityEmoji(similarity: number): string {
		if (similarity >= 50) return '🔥';
		if (similarity >= 35) return '😊';
		if (similarity >= 20) return '🤔';
		if (similarity >= 10) return '😐';
		if (similarity >= 0) return '❄️';
		return '🧊';
	}

	function getTemperature(similarity: number): string {
		return `${similarity.toFixed(2)}°C`;
	}

	function getRankProgress(rank: number | undefined): number {
		if (!rank) return 0;
		return Math.max(0, Math.min(100, ((1000 - rank) / 1000) * 100));
	}
</script>

<Header />
<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8 text-center">
			<h1
				class="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent"
			>
				Cémantix
			</h1>
			<p class="text-lg text-gray-600">Trouvez le mot mystère grâce à la proximité sémantique</p>
			<div class="mt-4 flex justify-center gap-8">
				<div class="text-center">
					<p class="text-3xl font-bold text-blue-600">{nbEssai}</p>
					<p class="text-sm text-gray-500">Essais</p>
				</div>
				{#if wordLength > 0}
					<div class="text-center">
						<p class="text-3xl font-bold text-purple-600">{wordLength}</p>
						<p class="text-sm text-gray-500">Lettres</p>
					</div>
				{/if}
			</div>
		</div>

		{#if message}
			<div
				class="mb-6 rounded-lg border-2 {gameWon
					? 'border-green-400 bg-green-50'
					: 'border-blue-400 bg-blue-50'} p-4 text-center"
			>
				<p class="font-medium {gameWon ? 'text-green-800' : 'text-blue-800'}">{message}</p>
			</div>
		{/if}

		{#if !gameWon}
			<div class="mb-8">
				<form on:submit|preventDefault={sendGuess} class="flex gap-3">
					<input
						type="text"
						bind:value={userGuess}
						placeholder="Entrez votre proposition..."
						class="flex-1 rounded-lg border-2 border-gray-300 px-6 py-4 text-lg text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
						disabled={gameWon || wordLength === 0}
					/>
					<button
						type="submit"
						class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-bold text-white transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={gameWon || wordLength === 0}
					>
						Valider
					</button>
				</form>
			</div>
		{/if}

		{#if guesses.length > 0}
			<div class="mb-8 rounded-xl bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-2xl font-bold text-gray-800">
					Vos propositions ({guesses.length})
				</h2>
				<div class="space-y-2">
					{#each guesses as guess, index}
						{#if typeof guess.similarity === 'number'}
							<div
								class="flex items-center justify-between rounded-lg border-2 {getSimilarityColor(
									guess.similarity
								)} p-4 transition hover:shadow-md"
							>
								<div class="flex items-center gap-4">
									<span class="text-2xl">{getSimilarityEmoji(guess.similarity)}</span>
									<div>
										<p class="text-lg font-bold">{guess.word}</p>
										<p class="text-sm opacity-75">
											Essai #{guess.attemptNumber}
											{#if guess.rank}
												<span class="ml-2 rounded-full bg-white/50 px-2 py-0.5 font-bold">
													🏆 Top {guess.rank}
												</span>
											{/if}
										</p>
									</div>
								</div>
								<div class="text-right">
									<p class="text-2xl font-bold">{getTemperature(guess.similarity)}</p>
									{#if guess.rank}
										<div class="mt-1 h-2 w-24 overflow-hidden rounded-full bg-white/50">
											<div
												class="h-full bg-current transition-all duration-500"
												style="width: {getRankProgress(guess.rank)}%"
											></div>
										</div>
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<div class="flex gap-4">
			<button
				on:click={newGame}
				class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-4 font-bold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
			>
				🔄 Nouvelle partie
			</button>
			{#if gameWon}
				<button
					class="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 font-bold text-white transition hover:from-green-700 hover:to-emerald-700"
				>
					📤 Partager résultat
				</button>
			{/if}
		</div>

		<div class="mt-8 rounded-xl bg-white p-6 shadow-lg">
			<h3 class="mb-4 text-2xl font-bold text-gray-800">📖 Règles du jeu</h3>
			<ol class="space-y-3 text-gray-700">
				<li class="flex gap-3">
					<span class="font-bold text-blue-600">1.</span>
					<p>Trouvez le mot mystère en proposant des mots un par un</p>
				</li>
				<li class="flex gap-3">
					<span class="font-bold text-blue-600">2.</span>
					<p>Chaque proposition reçoit un score de proximité sémantique</p>
				</li>
				<li class="flex gap-3">
					<span class="font-bold text-blue-600">3.</span>
					<p>Le pourcentage peut être négatif si les mots sont très éloignés sémantiquement</p>
				</li>
				<li class="flex gap-3">
					<span class="font-bold text-blue-600">4.</span>
					<p>Plus votre mot est proche sémantiquement, plus le score est élevé</p>
				</li>
				<li class="flex gap-3">
					<span class="font-bold text-blue-600">5.</span>
					<p>Vos propositions sont triées par proximité pour vous guider</p>
				</li>
				<li class="flex gap-3">
					<span class="font-bold text-blue-600">6.</span>
					<p>Continuez jusqu'à trouver le mot exact !</p>
				</li>
			</ol>

			<div class="mt-6 grid grid-cols-2 gap-3 text-center text-sm md:grid-cols-6">
				<div class="rounded-lg border-2 border-blue-400 bg-blue-100 p-3">
					<p class="font-bold text-blue-800">🧊 Négatif</p>
					<p class="text-blue-600">Glacial</p>
				</div>
				<div class="rounded-lg border-2 border-red-400 bg-red-100 p-3">
					<p class="font-bold text-red-800">❄️ 0-10°C</p>
					<p class="text-red-600">Très froid</p>
				</div>
				<div class="rounded-lg border-2 border-orange-400 bg-orange-100 p-3">
					<p class="font-bold text-orange-800">😐 10-20°C</p>
					<p class="text-orange-600">Froid</p>
				</div>
				<div class="rounded-lg border-2 border-yellow-400 bg-yellow-100 p-3">
					<p class="font-bold text-yellow-800">🤔 20-35°C</p>
					<p class="text-yellow-600">Tiède</p>
				</div>
				<div class="rounded-lg border-2 border-lime-400 bg-lime-100 p-3">
					<p class="font-bold text-lime-800">😊 35-50°C</p>
					<p class="text-lime-600">Chaud</p>
				</div>
				<div class="rounded-lg border-2 border-green-400 bg-green-100 p-3">
					<p class="font-bold text-green-800">🔥 50°C+</p>
					<p class="text-green-600">Brûlant !</p>
				</div>
			</div>
		</div>
	</div>
</div>
