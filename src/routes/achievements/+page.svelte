<script lang="ts">
	import { sessionStore } from '$lib/store/sessionStore';
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	$: idUser = $sessionStore?.id ?? null;
	let userAllAchievements = 0;
	let userAllRareAchievements = 0;
	let userMissingAchievements = 0;
	let userAllAchievementsUnlock: number[] = [];

	let repbodyAchievements: {
		AllAchievements: number;
		AllRareAchievements: number;
		AllMissingAchievements: number;
		achievementsIds: number[];
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
			userAllAchievementsUnlock = repbodyAchievements.achievementsIds ?? [];
			applyAchievementsStyles();
		} catch (error) {
			console.error('Erreur Server:', error);
			throw error;
		}
	}

	function applyAchievementsStyles() {
		const achievements = document.querySelectorAll<HTMLElement>('.achievement');

		achievements.forEach((achievement) => {
			const id = Number(achievement.dataset.id);
			const card = achievement.closest('.rounded-lg') as HTMLElement;
			const status = card.querySelector<HTMLElement>('.achievement-status');
			const icon = card.querySelector<HTMLElement>('.rounded-full');
			const description = card.querySelector<HTMLElement>('.text-sm.text-gray-600');
			const isUnlocked = userAllAchievementsUnlock.includes(id);

			if (!isUnlocked) {
				card.classList.add('bg-gray-200');
				card.classList.remove('bg-white');

				achievement.classList.add('text-gray-500');
				achievement.classList.remove('text-gray-900');

				if (icon) {
					icon.classList.add('bg-gray-400');
					icon.classList.remove('bg-gray-700');
				}

				if (description) {
					description.classList.add('text-gray-500');
					description.classList.remove('text-gray-600');
				}

				if (status) {
					status.textContent = 'Non obtenu';
					status.classList.add('text-gray-500');
					status.classList.remove('text-green-600');
				}
			} else {
				card.classList.add('bg-white');
				card.classList.remove('bg-gray-200');

				achievement.classList.add('text-gray-900');
				achievement.classList.remove('text-gray-500');

				if (icon) {
					icon.classList.add('bg-gray-700');
					icon.classList.remove('bg-gray-400');
				}

				if (description) {
					description.classList.add('text-gray-600');
					description.classList.remove('text-gray-500');
				}

				if (status) {
					status.textContent = 'Obtenu';
					status.classList.add('text-green-600');
					status.classList.remove('text-gray-500');
				}
			}
		});
	}
	onMount(() => {
		getInformationAchievements();
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
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
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
				<p data-id="1" class="achievement mb-2 font-semibold text-gray-900">Premier pas</p>
				<p class="mb-3 text-sm text-gray-600">Jouer votre première partie</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="2" class="achievement mb-2 font-semibold text-gray-900">Jouer confirmée</p>
				<p class="mb-3 text-sm text-gray-600">Jouer 10 parties</p>
				<p class="achievement-status text-xs text-gray-500">Non Obtenu</p>
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
				<p data-id="3" class="achievement mb-2 font-semibold text-gray-900">
					Divinité de Sémantopia
				</p>
				<p class="mb-3 text-sm text-gray-600">Jouer 50 parties</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="4" class="achievement mb-2 font-semibold text-gray-900">
					Apprenti sémantopiste
				</p>
				<p class="mb-3 text-sm text-gray-600">Jouer à tous les jeux</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="5" class="achievement mb-2 font-semibold text-gray-900">Bling-Bling</p>
				<p class="mb-3 text-sm text-gray-600">Obtenir 5 badges</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="6" class="achievement mb-2 font-semibold text-gray-900">Couvre moi de badges</p>
				<p class="mb-3 text-sm text-gray-600">Obtenir 10 badges</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="7" class="achievement mb-2 font-semibold text-gray-900">Fin ?</p>
				<p class="mb-3 text-sm text-gray-600">Obtenir tous les badges</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="8" class="achievement mb-2 font-semibold text-gray-900">
					Juniors de Sémantopia
				</p>
				<p class="mb-3 text-sm text-gray-600">Compte d'une semaine</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="9" class="achievement mb-2 font-semibold text-gray-900">
					Vétéran de Sémantopia
				</p>
				<p class="mb-3 text-sm text-gray-600">Compte d'un mois</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="10" class="achievement mb-2 font-semibold text-gray-900">
					Séniors de Sémantopia
				</p>
				<p class="mb-3 text-sm text-gray-600">Compte de 3 mois</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="11" class="achievement mb-2 font-semibold text-gray-900">Créateur</p>
				<p class="mb-3 text-sm text-gray-600">Être développeur de Sémantopia</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="12" class="achievement mb-2 font-semibold text-gray-900">???</p>
				<p class="mb-3 text-sm text-gray-600">Faire le konami code</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="13" class="achievement mb-2 font-semibold text-gray-900">Chasseur de mots</p>
				<p class="mb-3 text-sm text-gray-600">
					Gagner 5 parties sur pédantix, cémantix, corrélix, motix
				</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="14" class="achievement mb-2 font-semibold text-gray-900">Chasseur de lettres</p>
				<p class="mb-3 text-sm text-gray-600">
					Faire un score de 5 sur lettix, mimix, panix, chainix
				</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="15" class="achievement mb-2 font-semibold text-gray-900">Une idée brillante</p>
				<p class="mb-3 text-sm text-gray-600">
					Gagner une partie de pédantix en moins de 25 essais
				</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="16" class="achievement mb-2 font-semibold text-gray-900">
					Œil pour œil, mot pour mot
				</p>
				<p class="mb-3 text-sm text-gray-600">
					Gagner une partie de pédantix en moins de 10 essais
				</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="17" class="achievement mb-2 font-semibold text-gray-900">Dans le mille</p>
				<p class="mb-3 text-sm text-gray-600">Gagner une partie de motix en 2 coups</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="18" class="achievement mb-2 font-semibold text-gray-900">
					Merci pour la partie
				</p>
				<p class="mb-3 text-sm text-gray-600">
					Gagner une partie de cémantix en moins de 30 essais
				</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="19" class="achievement mb-2 font-semibold text-gray-900">
					Prends en de la graine
				</p>
				<p class="mb-3 text-sm text-gray-600">
					Gagner une partie de cémantix en moins de 15 essais
				</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="20" class="achievement mb-2 font-semibold text-gray-900">La clé du succès</p>
				<p class="mb-3 text-sm text-gray-600">
					Gagner une partie sur corrélix en moins de 3 étapes
				</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
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
				<p data-id="21" class="achievement mb-2 font-semibold text-gray-900">Sérieux dévouement</p>
				<p class="mb-3 text-sm text-gray-600">
					Gagner une partie sur corrélix en moins de 10 essais
				</p>
				<p class="achievement-status text-xs text-gray-500">Non obtenu</p>
			</div>
		</div>
	</section>
</section>
