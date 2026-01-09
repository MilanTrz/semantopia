<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { sessionStore } from '$lib/store/sessionStore';
	import { emitGameEvent } from '$lib/store/gameEventStore';
	import { initKonamiCodeDetection } from '$lib/utils/achievement/konamiCode';
	import { createAccountAgeEvent } from '$lib/utils/achievement/accountAgeChecker';
	import type { GameEventData } from '$lib/models/achievements';

	let { children } = $props();

	onMount(() => {
		// Initialiser la détection du code Konami
		const cleanupKonami = initKonamiCodeDetection(() => {
			const userId = $sessionStore?.id ?? 0;
			if (userId) {
				console.log('🎮 Code Konami détecté!');
				const eventData: GameEventData = {
					userId,
					gameType: 'none',
					won: true,
					konamiCode: true
				};
				emitGameEvent(eventData);
			}
		});

		const checkAccountAge = async () => {
			const userId = $sessionStore?.id ?? 0;
			if (userId) {
				const accountEvent = await createAccountAgeEvent(userId);
				if (accountEvent) {
					const eventData: GameEventData = {
						userId,
						gameType: 'none',
						won: true,
						accountAgeMs: accountEvent.accountAgeMs
					};
					emitGameEvent(eventData);
				}
			}
		};

		checkAccountAge();

		return () => {
			cleanupKonami();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
