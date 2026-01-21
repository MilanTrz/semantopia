<script lang="ts">
	import Header from '$lib/header.svelte';
	import OtherGames from '$lib/OtherGames.svelte';
	import { triggerConfettiAnimation, GameInput, GameActions, GameStats, CemantixRules, LoadingState, GameMessage } from '$lib';
	import { emitGameEvent } from '$lib/store/gameEventStore';
	import type { GameEventData } from '$lib/models/achievements';
	import { sessionStore } from '$lib/store/sessionStore';
	import { onMount } from 'svelte';

	let userGuess = '';
	let guesses: {
		word: string;
		similarity: number | false;
		attemptNumber: number;
		rank?: number;
	}[] = [];
	let nbEssai = 0;
	let gameWon = false;
	let gameSurrendered = false;
	let targetWord = '';
	let wordLength = 0;
	let message = '';
	let sessionId = '';

	const session = sessionStore.get();
	const idUser: number | null = session ? session.id : 0;
	
	let partiesJouees: number = 0;
	let tauxReussite: number = 0;
	let essaisMoyen: number = 0.0;
	let serieActuelle: number = 0;

	let repbodyStats: {
		nbParties: number;
		nbEssaiMoyen: number;
		tauxReussite: number;
		serieActuelle: number;
	};


	async function newGame() {
		nbEssai = 0;
		guesses = [];
		gameWon = false;
		gameSurrendered = false;
		targetWord = '';
		userGuess = '';
		message = '';
		sessionId = '';

		try {
			const response = await fetch('/game/cemantix/?userId=' + idUser, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await response.json();
			if (response.status === 201) {
				sessionId = data.sessionId;
				wordLength = data.wordLength;
				message = 'Nouvelle partie créée ! Trouvez le mot mystère.';
			} else {
				message = data.message ?? 'Impossible de créer une partie.';
			}
		} catch (error) {
			message = 'Erreur lors de la création de la partie.';
			console.error(error);
		}
	}

	async function surrenderGame() {
		gameSurrendered = true;
		gameWon = false;
		// Révéler la réponse
		message = `Partie abandonnée. Le mot mystère était "${targetWord || 'inconnu'}".`;
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

		if (!sessionId) {
			message = 'Aucune partie active. Relancez une partie pour jouer.';
			userGuess = '';
			return;
		}

		nbEssai++;

		try {
			const response = await fetch('/game/cemantix/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userGuess: userGuess.trim(), sessionId })
			});

			const data = await response.json();

			if (response.status === 400) {
				message = data.message ?? 'Aucune partie active. Relancez une partie.';
				nbEssai--;
				return;
			}

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

						const eventData: GameEventData = {
							userId: $sessionStore?.id ?? 0,
							type: 'cemantix',
							won: true,
							attempts: nbEssai
						};
						emitGameEvent(eventData);
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
	async function getStatistics() {
		try {
			const responseStats: Response = await fetch('/api/statistiques', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: idUser,
					gameType: 'cemantix'
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
	onMount(() => {
		newGame();
		if (idUser) {
			getStatistics();
		}
	});
</script>

<Header />
<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto flex max-w-7xl gap-12">
		<div class="max-w-3xl flex-1">
			<div class="mb-8">
				<h1 class="mb-2 text-4xl font-bold text-gray-900">
					<i class="fa-solid fa-brain mr-3 text-pink-600" aria-hidden="true"></i>
					Cémantix
				</h1>
				<p class="text-gray-600">Trouvez le mot mystère grâce à la proximité sémantique</p>
				<div class="mt-4 flex gap-6">
					<div class="text-center">
						<p class="text-3xl font-bold text-pink-600">{nbEssai}</p>
						<p class="text-sm text-gray-500">Essais</p>
					</div>
					{#if wordLength > 0}
						<div class="text-center">
							<p class="text-3xl font-bold text-rose-600">{wordLength}</p>
							<p class="text-sm text-gray-500">Lettres</p>
						</div>
					{/if}
				</div>
			</div>

			{#if message}
			<GameMessage
				type={gameWon ? 'victory' : 'info'}
				message={message}
			/>
		{/if}

		{#if !gameWon}
			<div class="mb-8">
				<GameInput
					bind:value={userGuess}
					placeholder="Entrez votre proposition..."
					disabled={gameWon || gameSurrendered || wordLength === 0}
					gradient="from-pink-600 via-rose-500 to-orange-400"
					buttonText="Valider"
					onsubmit={sendGuess}
					oninput={(value) => (userGuess = value)}
				/>
			</div>
		{/if}

		{#if guesses.length > 0}
			<div class="mb-8 rounded-xl bg-white p-6 shadow-sm">
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
				{#if !gameWon}
					<button
						on:click={surrenderGame}
						class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-4 font-bold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
					>
						🏳️ Abandonner
					</button>
				{:else}
					<GameActions
						isGameOver={gameWon || gameSurrendered}
						gradient="from-pink-600 via-rose-500 to-orange-400"
						onNewGame={newGame}
						onSurrender={surrenderGame}
						surrenderDisabled={true}
					/>
				{/if}
			</div>
		</div>

		<!-- Sidebar droite -->
		<div class="w-80 shrink-0 space-y-6">
			<!-- Règles -->
			<CemantixRules />
			{#if idUser}
				<GameStats
					stats={[
						{ label: 'Parties jouées', value: partiesJouees, color: 'text-blue-700' },
						{ label: 'Taux de réussite', value: `${Math.round(tauxReussite * 100)}%`, color: 'text-green-600' },
						{ label: 'Essais moyen', value: `${Math.round(essaisMoyen * 100) / 100}`, color: 'text-cyan-600' },
						{ label: 'Série actuelle', value: serieActuelle, color: 'text-blue-500' }
					]}
				/>
			{/if}
			<OtherGames exclude="cemantix" />
		</div>
	</div>
</div>
