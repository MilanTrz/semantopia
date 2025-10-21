<script>
	import { sessionStore } from './store/sessionStore';
	let pseudo = sessionStore.get().pseudo;
	console.log(pseudo)
</script>

<nav class="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
	<div class="flex items-center gap-3">
		<img src="/src/lib/assets/logo.png" alt="Logo du site web" width="40" height="40" />
		<h3 class="text-xl font-bold text-gray-800">Sémantopia</h3>
	</div>
	<div>
		<ul class="flex items-center gap-6">
			<li><a href="/login" class="text-gray-600 transition hover:text-purple-600">Jouer</a></li>
			<li><a href="/login" class="text-gray-600 transition hover:text-purple-600">A propos</a></li>
			<li><a href="/login" class="text-gray-600 transition hover:text-purple-600">Profil</a></li>
			<li><p>{pseudo}</p></li>
		</ul>
	</div>
</nav>
