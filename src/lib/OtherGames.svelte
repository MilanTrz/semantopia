<script lang="ts">
	import { getOtherGames } from './gameConfig';

	export let exclude: string = '';

	$: filteredGames = getOtherGames(exclude);
</script>

<div class="rounded-lg bg-white p-6 shadow-sm">
	<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">🎮 Autres jeux</h4>
	<div class="space-y-3">
		{#each filteredGames as game}
			<a
				href={`/game/${game.slug}`}
				class="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition hover:bg-purple-50"
			>
				<span
					class={`mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${game.gradient} text-white`}
				>
					<i class={`fa-solid ${game.icon} text-lg`} aria-hidden="true"></i>
				</span>
				<h5 class="font-medium text-gray-700">{game.label}</h5>
			</a>
		{/each}
	</div>
</div>
