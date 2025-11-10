<script lang="ts">
	import Header from '$lib/header.svelte';
</script>

<Header />
<section class="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-8 py-16">
	<div class="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
		<div class="text-white">
			<h2 class="mb-4 text-4xl font-bold">
				Bienvenue dans <span class="text-yellow-300">Sémantopia</span>
			</h2>
			<p class="mb-6 text-lg leading-relaxed">
				L'univers fascinant des jeux de mots vous attend ! Développez votre vocabulaire, stimulez
				votre esprit et défiez vos amis dans une aventure linguistique unique.
			</p>
		</div>
		<div
			class="bg-opacity-40 rounded-2xl bg-purple-700 p-8 text-center text-white backdrop-blur-sm"
		>
			<img
				src="/src/lib/assets/puzzle.png"
				alt="Logo du site web"
				width="60"
				height="60"
				class="mx-auto mb-4"
			/>
			<h3 class="mb-3 text-2xl font-bold">Jeux intéractifs</h3>
			<p class="text-purple-100">
				Découvrez nos 4 jeux uniques conçus pour défier votre intelligence linguistique
			</p>
		</div>
	</div>
</section>

<section class="bg-gray-50 px-8 py-16">
	<h2 class="mb-2 text-center text-3xl font-bold">🎯Choisissez votre défi</h2>
	<p class="mb-12 text-center text-gray-600">Quatre jeux innovants pour tous les niveaux</p>

	<div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-4">
		<a
			href="/game/cemantix"
			class="cursor-pointer rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md"
		>
			<div class="rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100"
				>
					<img
						src="/src/lib/assets/logo_Cémantix.png"
						alt="Logo du site web"
						width="40"
						height="40"
					/>
				</div>
				<h4 class="mb-3 text-xl font-bold text-gray-800">Cémantix</h4>
				<p class="text-sm text-gray-600">
					Trouvez le mot mystère grâce aux associations sémantiques et à l'intelligence artificielle
				</p>
			</div>
		</a>
		<a
			href="/game/pedantix"
			class="cursor-pointer rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md"
		>
			<div class="rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
				>
					<img
						src="/src/lib/assets/logo_Pédantix.png"
						alt="Logo du site web"
						width="40"
						height="40"
					/>
				</div>
				<h4 class="mb-3 text-xl font-bold text-gray-800">Pédantix</h4>
				<p class="text-sm text-gray-600">
					Découvrez l'article Wikipédia caché mot par mot dans ce jeu de déduction
				</p>
			</div>
		</a>
		<a
			href="/game/motix"
			class="cursor-pointer rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md"
		>
			<div class="rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
				>
					<img src="/src/lib/assets/logo_Motix.png" alt="Logo du site web" width="40" height="40" />
				</div>
				<h4 class="mb-3 text-xl font-bold text-gray-800">Motix</h4>
				<p class="text-sm text-gray-600">
					Créez un maximum de mots avec les lettres proposées dans le temps imparti
				</p>
			</div>
		</a>
		<a
			href="/game/correlix"
			class="cursor-pointer rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md"
		>
			<div class="rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100"
				>
					<img
						src="/src/lib/assets/logo_Correlix.png"
						alt="Logo du site web"
						width="40"
						height="40"
					/>
				</div>
				<h4 class="mb-3 text-xl font-bold text-gray-800">Corrélix</h4>
				<p class="text-sm text-gray-600">
					Trouvez les mots liés par des corrélations surprenantes et logiques
				</p>
			</div>
		</a>
	</div>
</section>

<footer class="bg-gray-900 px-8 py-12 text-white">
	<div class="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
		<h3 class="text-2xl font-bold">🏠Sémantopia</h3>
		<p class="max-w-md text-gray-400">
			La plateforme de référence pour les jeux de mots et défis linguistiques en français.
		</p>
		<div class="my-4 h-px w-full bg-gray-700"></div>
		<p class="text-sm text-gray-500">
			© 2025 Sémantopia. Tous droits réservés. 🇫🇷 Fièrement français.
		</p>
	</div>
</footer>
