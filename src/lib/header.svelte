<script lang="ts">
	import { goto } from '$app/navigation';
	import { sessionStore } from './store/sessionStore';
	let session = sessionStore.get();
	let pseudo: string | null = session ? session.pseudo : null;
	let isAdmin: boolean | null = session ? session.isAdmin : null;
	$: avatar = $sessionStore?.avatar || '/photo_profil/photo_default.png';
	async function logout() {
		sessionStore.clear();
		await fetch('/api/logout', {
			method: 'DELETE'
		});
		window.setTimeout(() => {
			goto('/login');
		});
	}
</script>

<nav class="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
	<div class="flex items-center gap-3">
		<a href="/home">
			<img src="/src/lib/assets/logo.png" alt="Logo du site web" width="40" height="40" />
		</a>
		<a href="/home">
			<h3 class="text-xl font-bold text-gray-800">Sémantopia</h3>
		</a>
	</div>
	<div>
		<ul class="flex items-center gap-6">
			<li><a href="/login" class="text-gray-600 transition hover:text-purple-600">A propos</a></li>
			{#if pseudo}
				<li><a href="/profil" class="text-gray-600 transition hover:text-purple-600">Profil</a></li>
				<li>
					<a href="/achievements" class="text-gray-600 transition hover:text-purple-600">Badges</a>
				</li>
				{#if isAdmin}
					<li>
						<a href="/challenge" class="text-gray-600 transition hover:text-purple-600">Challenge</a
						>
					</li>
				{/if}
				<li><p>{pseudo}</p></li>
				<img src={avatar} alt="photo_profil" class="rounded-lg" width="40" height="40" />
				<button
					class="rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700"
					on:click={logout}>Se deconnecter</button
				>
			{:else}
				<li>
					<button class="text-gray-600 transition hover:text-purple-600"
						><a href="/login">Se connecter</a></button
					>
				</li>
				<li>
					<button
						class="rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700"
						><a href="/register">Créer un compte</a></button
					>
				</li>
			{/if}
		</ul>
	</div>
</nav>
