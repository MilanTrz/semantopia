<script lang="ts">
	import { sessionStore } from '$lib/store/sessionStore';
	import { gameEventEmitter } from '$lib/store/gameEventStore';
	import Header from '$lib/header.svelte';
	import { ACHIEVEMENTS } from '$lib/models/achievements';
	import { checkAndUnlockAchievements } from '$lib/utils/achievement/achievementManager';
	import { onMount } from 'svelte';
	import './achievements.css';

	$: idUser = $sessionStore?.id ?? null;
	let userAllAchievements = 0;
	let userAllRareAchievements = 0;
	let userMissingAchievements = 0;
	let userAllAchievementsUnlock: number[] = [];
	let isLoading = true;

	async function getInformationAchievements() {
		if (!idUser) return;
		
		try {
			const response = await fetch('/achievements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: idUser
				})
			});
			const data = await response.json();
			userAllAchievements = data.AllAchievements ?? 0;
			userMissingAchievements = data.AllMissingAchievements ?? 0;
			userAllAchievementsUnlock = (data.achievementsIds ?? []);
			
			userAllRareAchievements = ACHIEVEMENTS.filter(
				ach => ach.rarity >= 1 && userAllAchievementsUnlock.includes(ach.id)
			).length;
		} catch (error) {
			console.error('Erreur Server:', error);
		} finally {
			isLoading = false;
		}
	}

	$: unlockedSet = new Set(userAllAchievementsUnlock);

	function getAchievementStatusClass(achievementId: number, unlockedIds: Set<number>, rarity: number) {
		const isUnlocked = unlockedIds.has(achievementId);
		const baseCard = isUnlocked ? 'bg-white shadow-lg hover:shadow-xl' : 'bg-gray-200 shadow hover:shadow-md';
		
		const enchantmentClass = isUnlocked && rarity >= 1 ? `enchantment-${rarity}` : '';
		
		const iconColors = {
			0: isUnlocked ? 'bg-gradient-to-br from-gray-700 to-gray-800 shadow-md' : 'bg-gray-400',
			1: isUnlocked ? 'bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 shadow-lg' : 'bg-gray-400',
			2: isUnlocked ? 'bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 shadow-lg' : 'bg-gray-400'
		};
		
		return {
			card: `${baseCard} ${enchantmentClass} transition-all duration-300 transform hover:scale-105`,
			title: isUnlocked ? 'text-gray-900 font-bold' : 'text-gray-500',
			icon: iconColors[rarity as keyof typeof iconColors] || iconColors[0],
			description: isUnlocked ? 'text-gray-700' : 'text-gray-500',
			status: isUnlocked ? 'text-green-600 font-semibold' : 'text-gray-500',
			statusText: isUnlocked ? 'Obtenu' : 'Non obtenu'
		};
	}

	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		getInformationAchievements();

		unsubscribe = gameEventEmitter.subscribe(async (eventData) => {
			if (eventData && idUser && userAllAchievementsUnlock.length > 0) {
				await checkAndUnlockAchievements(eventData, userAllAchievementsUnlock);
				setTimeout(() => {
					getInformationAchievements();
				}, 500);
			}
		});

		return () => {
			if (unsubscribe) unsubscribe();
		};
	});
</script>

<Header />
<section class="mx-auto max-w-6xl px-8 py-8">
	<section class="mb-8">
		<h2 class="mb-2 text-3xl font-bold text-gray-900">Mes badges</h2>
		<p class="mb-8 text-gray-600">
			Découvrez tous les badges que vous avez obtenus au cours de votre parcours sur Sémantopia
		</p>

		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="rounded-lg bg-white p-6 text-center shadow">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800"
				>
					<i class="fa-solid fa-star text-2xl text-white"></i>
				</div>
				<p class="mb-1 text-3xl font-bold text-gray-900">{userAllAchievements}</p>
				<p class="text-sm text-gray-600">Badges obtenus</p>
			</div>

			<div class="rounded-lg bg-white p-6 text-center shadow">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800"
				>
					<i class="fa-solid fa-gem text-2xl text-white"></i>
				</div>
				<p class="mb-1 text-3xl font-bold text-gray-900">{userAllRareAchievements}</p>
				<p class="text-sm text-gray-600">Badges rares</p>
			</div>

			<div class="rounded-lg bg-white p-6 text-center shadow">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700"
				>
					<i class="fa-solid fa-lock text-2xl text-white"></i>
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
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			{#each ACHIEVEMENTS as achievement (achievement.id)}
				{@const statusClasses = getAchievementStatusClass(achievement.id, unlockedSet, achievement.rarity)}
				<div class="rounded-lg {statusClasses.card} p-6 text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full {statusClasses.icon} transition-transform duration-300"
					>
						<i class="fa-solid {achievement.icon} text-2xl text-white"></i>
					</div>
					<p data-id={achievement.id} class="achievement mb-2 {statusClasses.title}">
						{achievement.title}
					</p>
					<p class="mb-3 text-sm {statusClasses.description}">{achievement.description}</p>
					<p class="achievement-status text-xs {statusClasses.status}">{statusClasses.statusText}</p>
				</div>
			{/each}
		</div>
	</section>
</section>
