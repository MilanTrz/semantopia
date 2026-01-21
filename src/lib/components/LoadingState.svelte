<script lang="ts">
	type Props = {
		message?: string;
		color?: string;
	};

	let { message = 'Chargement de la partie...', color = 'purple' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-12">
	<div
		class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-{color}-200 border-t-{color}-600"
	></div>
	<p class="font-medium text-gray-600">{message}</p>
</div>
