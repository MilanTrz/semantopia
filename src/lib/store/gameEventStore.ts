import { writable } from 'svelte/store';
import type { GameEventData } from '$lib/models/achievements';

export const gameEventEmitter = writable<GameEventData | null>(null);

export function emitGameEvent(eventData: GameEventData) {
	gameEventEmitter.set(eventData);
	setTimeout(() => gameEventEmitter.set(null), 100);
}
