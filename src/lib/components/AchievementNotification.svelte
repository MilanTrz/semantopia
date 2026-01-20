<script lang="ts">
	import { achievementNotifications } from '$lib/store/achievementNotificationStore';
	import type { AchievementNotification } from '$lib/store/achievementNotificationStore';

	let notifications: AchievementNotification[] = [];

	achievementNotifications.subscribe((value) => {
		notifications = value;
	});

	function getBorderColor(rarity: number): string {
		switch (rarity) {
			case 2:
				return 'border-amber-400';
			case 1:
				return 'border-violet-400';
			default:
				return 'border-cyan-400';
		}
	}

	function getIconBgGradient(rarity: number): string {
		switch (rarity) {
			case 2:
				return 'bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600';
			case 1:
				return 'bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600';
			default:
				return 'bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600';
		}
	}

	function getLabelColor(rarity: number): string {
		switch (rarity) {
			case 2:
				return 'text-amber-400';
			case 1:
				return 'text-violet-400';
			default:
				return 'text-cyan-400';
		}
	}
</script>

<div class="pointer-events-none fixed top-5 right-5 z-50 max-w-sm space-y-2 sm:max-w-sm">
	{#each notifications as notification (notification.id)}
		<div
			class="bg-gradient-to-br from-gray-800 to-gray-900 {getBorderColor(
				notification.achievement.rarity
			)} animate-slide-in-right pointer-events-auto w-full rounded-lg border-4 p-4 shadow-2xl sm:w-96"
		>
			<div class="flex items-start gap-4">
				<div
					class="flex h-12 w-12 flex-shrink-0 items-center justify-center {getIconBgGradient(
						notification.achievement.rarity
					)} rounded-md shadow-lg"
				>
					<i class="fas {notification.achievement.icon} text-2xl text-white drop-shadow-md"></i>
				</div>
				<div class="flex-1">
					<div
						class="text-xs font-bold tracking-wider uppercase {getLabelColor(
							notification.achievement.rarity
						)} drop-shadow-md"
					>
						Achievement Unlocked!
					</div>
					<div class="mt-1 text-base font-bold text-white drop-shadow-md">
						{notification.achievement.title}
					</div>
					<div class="mt-1 text-xs text-gray-300 drop-shadow-md">
						{notification.achievement.description}
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	@keyframes slide-in-right {
		from {
			transform: translateX(400px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	:global(.animate-slide-in-right) {
		animation: slide-in-right 0.5s ease-out;
	}
</style>
