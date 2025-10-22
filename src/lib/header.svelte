<script lang="ts">
	import { sessionStore } from './store/sessionStore';
	let session = sessionStore.get();
	let pseudo: string | null = session ? session.pseudo : null;
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
			<li><a href="/login" class="text-gray-600 transition hover:text-purple-600">Profil</a></li>
			{#if pseudo}
				<li><p>{pseudo}</p></li>
			{/if}
		</ul>
	</div>
</nav>
