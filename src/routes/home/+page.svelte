<script lang="ts">
	import Header from '$lib/header.svelte';
	import type { challenge } from '$lib/models/challenge';
	import { onMount } from 'svelte';
	import { sessionStore } from '$lib/store/sessionStore';
	import { GAMES } from '$lib/gameConfig';

	let lastChallenge: challenge = {
		name: '',
		description: '',
		gameName: '',
		nbTry: 0,
		nbHint: 0
	};
	let session = sessionStore.get();
	let userId: number | null = session ? session.id : null;
	async function getLastChallenge() {
		const response = await fetch('/home', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		const data = await response.json();
		lastChallenge = data.lastChallenge;
	}

	onMount(() => {
		//getLastChallenge();
	});
</script>

<Header />
<section class="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-8 py-16">
	<div class="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
		<div class="text-white">
			<h2 class="mb-4 text-4xl font-bold">
				Bienvenue dans <span class="text-yellow-300">Sémantopia</span>
			</h2>
			<p class="mb-6 text-lg leading-relaxed">
				L'univers fascinant des jeux de mots vous attend ! Développez votre vocabulaire, stimulez
				votre esprit et défiez vos amis dans une aventure linguistique unique.
			</p>
		</div>
		<div
			class="bg-opacity-40 rounded-2xl bg-purple-700 p-8 text-center text-white backdrop-blur-sm"
		>
			<img
				src="/src/lib/assets/puzzle.png"
				alt="Logo du site web"
				width="60"
				height="60"
				class="mx-auto mb-4"
			/>
			<h3 class="mb-3 text-2xl font-bold">Jeux intéractifs</h3>
			<p class="text-purple-100">
				Découvrez nos 4 jeux uniques conçus pour défier votre intelligence linguistique
			</p>
		</div>
	</div>
</section>

<section class="bg-gray-50 px-8 py-16">
	<h2 class="mb-2 text-center text-3xl font-bold">🎯Choisissez votre défi</h2>
	<p class="mb-12 text-center text-gray-600">Quatre jeux innovants pour tous les niveaux</p>

	<div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-4">
		{#each GAMES as game (game.slug)}
			<a
				href="/game/{game.slug}"
				class="cursor-pointer rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md"
			>
				<div class="rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md">
					<div
						class={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${game.gradient} text-white`}
					>
						<i class={`fa-solid ${game.icon} text-2xl`} aria-hidden="true"></i>
					</div>
					<h4 class="mb-3 text-xl font-bold text-gray-800">{game.label}</h4>
					<p class="text-sm text-gray-600">
						{game.description}
					</p>
				</div>
			</a>
		{/each}
	</div>
</section>
<!----
	-- implement later


{#if userId}
	<section class="mx-auto flex max-w-2xl flex-col gap-3 p-4">
		<div class="rounded-lg bg-white p-4 shadow-md">
			<div class="mb-2 flex items-center gap-2">
				<span class="text-xl">🏆</span>
				<h3 class="text-lg font-bold text-gray-800">Défi du Jour</h3>
			</div>
			<p class="mb-3 text-xs text-gray-500">
				{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
			</p>

			<h4 class="mb-2 text-base font-semibold text-gray-800">Défi {lastChallenge.name} Spécial</h4>
			<p class="mb-4 text-sm text-gray-600">{lastChallenge.description}</p>

			<a href="/pedantix">
				<button
					class="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
				>
					<span>🔄</span>
					Relever le défi maintenant
				</button>
			</a>
		</div>

		<div
			class="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-center text-white shadow-md"
		>
			<div class="mb-3">
				<span class="text-4xl">🎯</span>
			</div>
			<h3 class="mb-2 text-xl font-bold">Défi Quotidien</h3>
			<p class="text-xs opacity-90">Un nouveau challenge chaque jour pour tester vos limites</p>
		</div>
	</section>
{/if}
-->

<footer class="bg-gray-900 px-8 py-12 text-white">
	<div class="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
		<h3 class="text-2xl font-bold">🏠Sémantopia</h3>
		<p class="max-w-md text-gray-400">
			La plateforme de référence pour les jeux de mots et défis linguistiques en français.
		</p>
		<div class="my-4 h-px w-full bg-gray-700"></div>
		<p class="text-sm text-gray-500">
			© 2025 Sémantopia. Tous droits réservés. 🇫🇷 Fièrement français.
		</p>
	</div>
</footer>
