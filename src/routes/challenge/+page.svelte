<script lang="ts">
	import Header from '$lib/header.svelte';
	let nameChallenge = '';
	let descriptionChallenge = '';
	let gameNameChallenge = '';
	let nbHintChallenge:number;
	let nbTryChallenge: number;

	async function createChallenge() {
		 await fetch('/challenge',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nameChallenge,
                descriptionChallenge,
                gameNameChallenge,
                nbHintChallenge,
                nbTryChallenge
             })
        })
         nameChallenge = '';
         descriptionChallenge = '';
         gameNameChallenge = '';
	}
</script>

<Header />
<section class="mx-auto max-w-2xl p-6">
	<div class="mb-6">
		<h1 class="text-2xl font-semibold text-gray-900">Créer un nouveau défi</h1>
		<p class="text-sm text-gray-900">Configurez les paramètres de votre défi</p>
	</div>
	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<form on:submit|preventDefault={createChallenge} class="space-y-4">
			<div>
				<label for="nameChallenge" class="mb-2 block text-sm font-medium text-gray-700">
					Nom du défi
				</label>
				<input
					id="nameChallenge"
					type="text"
					bind:value={nameChallenge}
					placeholder="Entrez le nom de votre défi"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				/>
			</div>

			<div>
				<label for="descriptionChallenge" class="mb-2 block text-sm font-medium text-gray-700">
					Description du défi
				</label>
				<input
					id="descriptionChallenge"
					type="text"
					bind:value={descriptionChallenge}
					placeholder="XXXXXXXXXXXXXXXXXXXXXX"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				/>
			</div>

			<div>
				<label for="gameNameChallenge" class="mb-2 block text-sm font-medium text-gray-700">
					Nom du jeu auquel le défi est attribué
				</label>
				<input
					id="gameNameChallenge"
					type="text"
					bind:value={gameNameChallenge}
					placeholder="motix"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				/>
			</div>

			<div>
				<label for="hintChallenge" class="mb-2 block text-sm font-medium text-gray-700">
					Nombre d'indices autorisé (optionnel)
				</label>
				<input
					id="hintChallenge"
					type="number"
					bind:value={nbHintChallenge}
					placeholder="2"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				/>
			</div>

			<div>
				<label for="tryChallenge" class="mb-2 block text-sm font-medium text-gray-700">
					Nombre d'essai autorisé (optionnel)
				</label>
				<input
					id="tryChallenge"
					type="number"
					bind:value={nbTryChallenge}
					placeholder="25"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				/>
			</div>

			<button
				type="submit"
				class="mt-6 w-full rounded-lg bg-gray-900 py-3 font-medium text-white shadow-sm transition hover:bg-gray-800"
			>
				Créer le défi
			</button>
		</form>
	</div>
</section>
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
