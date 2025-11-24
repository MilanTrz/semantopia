<script lang="ts">
	import { sessionStore } from '$lib/store/sessionStore';
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	$: idUser = $sessionStore?.id ?? null;
	let userAllAchievements = 0;
	let userAllRareAchievements = 0;
	let userMissingAchievements = 0;

	let repbodyAchievements: {
		AllAchievements: number;
		AllRareAchievements: number;
		AllMissingAchievements: number;
	};

	async function getInformationAchievements() {
		try {
			const response = await fetch('/achievements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: idUser
				})
			});
			repbodyAchievements = await response.json();
			userAllAchievements = repbodyAchievements.AllAchievements ?? 0;
			userAllRareAchievements = repbodyAchievements.AllRareAchievements ?? 0;
			userMissingAchievements = repbodyAchievements.AllMissingAchievements ?? 0;
		} catch (error) {
			console.error('Erreur Server:', error);
			throw error;
		}
	}
	onMount(() => {
		getInformationAchievements();
	});
</script>

<Header />
<section class="mx-auto max-w-6xl px-6 py-8">
	<section class="mb-8">
		<h2 class="mb-2 text-3xl font-bold text-gray-900">Mes badges</h2>
		<p class="mb-8 text-gray-600">
			Découvrez tous les badges que vous avez obtenus au cours de votre parcours sur Sémantopia
		</p>

		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
			<div class="rounded-lg bg-white p-6 text-center shadow">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800"
				>
					<img
						src="/src/lib/assets/assets_achievements/logoTotalBadgesObtenus.png"
						alt="logoTotalBadges"
						class="h-8 w-8"
					/>
				</div>
				<p class="mb-1 text-3xl font-bold text-gray-900">{userAllAchievements}</p>
				<p class="text-sm text-gray-600">Badges obtenus</p>
			</div>

			<div class="rounded-lg bg-white p-6 text-center shadow">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800"
				>
					<img
						src="/src/lib/assets/assets_achievements/logoBadgesRare.png"
						alt="logoBadgesRare"
						class="h-8 w-8"
					/>
				</div>
				<p class="mb-1 text-3xl font-bold text-gray-900">{userAllRareAchievements}</p>
				<p class="text-sm text-gray-600">Badges rares</p>
			</div>

			<div class="rounded-lg bg-white p-6 text-center shadow">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700"
				>
					<img
						src="/src/lib/assets/assets_achievements/logoADebloquer.png"
						alt="logoBadgesManquants"
						class="h-8 w-8"
					/>
				</div>
				<p class="mb-1 text-3xl font-bold text-gray-900">{userMissingAchievements}</p>
				<p class="text-sm text-gray-600">À débloquer</p>
			</div>
		</div>
	</section>

	<section>
		<div class="mb-6 flex items-center justify-between">
			<div class="flex gap-4">
				<button class="rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white"
					>Tous</button
				>
				<button
					class="rounded-full bg-transparent px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
					>Récents</button
				>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
			<div class="rounded-lg bg-white p-6 text-center shadow">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700"
				>
					<img
						src="/src/lib/assets/assets_achievements/logoPlayOneGame.png"
						alt="logoPlayOneGame"
						class="h-8 w-8"
					/>
				</div>
				<p class="mb-2 font-semibold text-gray-900">Premier pas</p>
				<p class="mb-3 text-sm text-gray-600">Jouer votre première partie</p>
				<p class="text-xs text-gray-500">Non obtenu</p>
			</div>

			<div class="rounded-lg bg-white p-6 text-center shadow">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700"
				>
					<img
						src="/src/lib/assets/assets_achievements/BadgesPlay10Parties.png"
						alt="logoPlayOneGame"
						class="h-8 w-8"
					/>
				</div>
				<p class="mb-2 font-semibold text-gray-900">Jouer confirmée</p>
				<p class="mb-3 text-sm text-gray-600">Jouer 10 parties</p>
				<p class="text-xs text-gray-500">Non Obtenu</p>
			</div>

			<div class="rounded-lg bg-white p-6 text-center shadow">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700"
				>
					<img
						src="/src/lib/assets/assets_achievements/badgesGetAllBadges.png"
						alt="logoPlayOneGame"
						class="h-8 w-8"
					/>
				</div>
				<p class="mb-2 font-semibold text-gray-900">Divinité de Sémantopia</p>
				<p class="mb-3 text-sm text-gray-600">Jouer 50 parties</p>
				<p class="text-xs text-gray-500">Non obtenu</p>
			</div>
		</div>
	</section>
</section>
