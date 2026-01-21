<script lang="ts">
	type Stat = {
		label: string;
		value: number | string;
		color: string;
	};

	type Props = {
		stats: Stat[];
	};

	let { stats }: Props = $props();
</script>

<div class="rounded-lg bg-white p-6 shadow-sm">
	<h4 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
		📊 Vos statistiques
	</h4>
	<div class="grid grid-cols-2 gap-6">
		{#each stats as stat}
			<div class="text-center">
				<p class="text-4xl font-bold {stat.color}">{stat.value}</p>
				<p class="mt-1 text-sm text-gray-600">{stat.label}</p>
			</div>
		{/each}
	</div>
</div>
