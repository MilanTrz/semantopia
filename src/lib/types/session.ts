export type SessionEntry<T> = {
	id: string;
	data: T;
	createdAt: number;
	updatedAt: number;
	expiresAt?: number;
};

export type UpdateFn<T> = (current: T) => T;

export type SessionStoreOptions = {
	ttlMs?: number;
	prefix?: string;
	now?: () => number;
};

export type SessionStore<T> = {
	create(data: T): SessionEntry<T>;
	get(id: string | undefined | null): SessionEntry<T> | null;
	update(id: string, next: UpdateFn<T> | T): SessionEntry<T> | null;
	remove(id: string): void;
	cleanup(): void;
};
