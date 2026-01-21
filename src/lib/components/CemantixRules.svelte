<script lang="ts">
	// Composant spécifique pour les règles de Cemantix avec le guide des couleurs
</script>

<div class="rounded-lg bg-white p-6 shadow-sm">
	<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">📖 Règles du jeu</h4>
	<ol class="space-y-3 text-sm text-gray-700">
		<li class="flex gap-3">
			<span class="font-bold text-pink-600">1.</span>
			<p>Trouvez le mot mystère en proposant des mots un par un</p>
		</li>
		<li class="flex gap-3">
			<span class="font-bold text-pink-600">2.</span>
			<p>Chaque proposition reçoit un score de proximité sémantique</p>
		</li>
		<li class="flex gap-3">
			<span class="font-bold text-pink-600">3.</span>
			<p>Le pourcentage peut être négatif si les mots sont très éloignés sémantiquement</p>
		</li>
		<li class="flex gap-3">
			<span class="font-bold text-pink-600">4.</span>
			<p>Plus votre mot est proche sémantiquement, plus le score est élevé</p>
		</li>
		<li class="flex gap-3">
			<span class="font-bold text-pink-600">5.</span>
			<p>Vos propositions sont triées par proximité pour vous guider</p>
		</li>
		<li class="flex gap-3">
			<span class="font-bold text-pink-600">6.</span>
			<p>Continuez jusqu'à trouver le mot exact !</p>
		</li>
	</ol>

	<div class="mt-6 grid grid-cols-2 gap-2 text-center text-xs">
		<div class="rounded-lg border-2 border-blue-400 bg-blue-100 p-2">
			<p class="font-bold text-blue-800">🧊 Négatif</p>
			<p class="text-blue-600">Glacial</p>
		</div>
		<div class="rounded-lg border-2 border-red-400 bg-red-100 p-2">
			<p class="font-bold text-red-800">❄️ 0-10°C</p>
			<p class="text-red-600">Très froid</p>
		</div>
		<div class="rounded-lg border-2 border-orange-400 bg-orange-100 p-2">
			<p class="font-bold text-orange-800">😐 10-20°C</p>
			<p class="text-orange-600">Froid</p>
		</div>
		<div class="rounded-lg border-2 border-yellow-400 bg-yellow-100 p-2">
			<p class="font-bold text-yellow-800">🤔 20-35°C</p>
			<p class="text-yellow-600">Tiède</p>
		</div>
		<div class="rounded-lg border-2 border-lime-400 bg-lime-100 p-2">
			<p class="font-bold text-lime-800">😊 35-50°C</p>
			<p class="text-lime-600">Chaud</p>
		</div>
		<div class="rounded-lg border-2 border-green-400 bg-green-100 p-2">
			<p class="font-bold text-green-800">🔥 50°C+</p>
			<p class="text-green-600">Brûlant !</p>
		</div>
	</div>
</div>
