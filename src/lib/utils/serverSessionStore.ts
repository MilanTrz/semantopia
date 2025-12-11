import { randomUUID } from 'crypto';
import type {
	SessionEntry,
	SessionStore,
	SessionStoreOptions,
	UpdateFn
} from '$lib/types/session';

function buildId(prefix?: string) {
	const base = prefix ? `${prefix}-` : '';
	return `${base}${randomUUID()}`;
}

export function createServerSessionStore<T>(
	options: SessionStoreOptions = {}
): SessionStore<T> {
	const store = new Map<string, SessionEntry<T>>();
	const ttlMs = options.ttlMs;
	const prefix = options.prefix;
	const clock = options.now ?? Date.now;

	const isExpired = (entry: SessionEntry<T>) =>
		typeof entry.expiresAt === 'number' && entry.expiresAt <= clock();

	const touch = (entry: SessionEntry<T>) => {
		const now = clock();
		entry.updatedAt = now;
		if (typeof ttlMs === 'number') {
			entry.expiresAt = now + ttlMs;
		}
		return entry;
	};

	return {
		create(data: T) {
			const now = clock();
			const entry: SessionEntry<T> = {
				id: buildId(prefix),
				data,
				createdAt: now,
				updatedAt: now,
				expiresAt: typeof ttlMs === 'number' ? now + ttlMs : undefined
			};
			store.set(entry.id, entry);
			return entry;
		},
		get(id) {
			if (!id) return null;
			const entry = store.get(id);
			if (!entry) return null;
			if (isExpired(entry)) {
				store.delete(id);
				return null;
			}
			return touch(entry);
		},
		update(id, next) {
			const entry = this.get(id);
			if (!entry) return null;
			const nextData = typeof next === 'function' ? (next as UpdateFn<T>)(entry.data) : next;
			const updated = touch({ ...entry, data: nextData });
			store.set(id, updated);
			return updated;
		},
		remove(id) {
			store.delete(id);
		},
		cleanup() {
			for (const [id, entry] of store.entries()) {
				if (isExpired(entry)) {
					store.delete(id);
				}
			}
		}
	};
}
