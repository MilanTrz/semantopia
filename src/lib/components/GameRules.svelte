<script lang="ts">
	type Props = {
		rules: string[];
	};

	let { rules }: Props = $props();
</script>

<div class="rounded-lg bg-white p-6 shadow-sm">
	<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">📖 Règles du jeu</h4>
	<ul class="space-y-3 text-sm text-gray-600">
		{#each rules as rule}
			<li class="flex items-start">
				<span class="mr-2">•</span>
				<p>{rule}</p>
			</li>
		{/each}
	</ul>
</div>
