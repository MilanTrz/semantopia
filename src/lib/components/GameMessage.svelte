<script lang="ts">
	type Props = {
		message: string;
		type?: 'victory' | 'defeat' | 'info';
	};

	let { message, type = 'defeat' }: Props = $props();

	const colorClass = type === 'victory' 
		? 'border-green-500 bg-green-100'
		: type === 'info'
		? 'border-blue-500 bg-blue-100'
		: 'border-red-500 bg-red-100';
	
	const textColorClass = type === 'victory'
		? 'text-green-700'
		: type === 'info'
		? 'text-blue-700'
		: 'text-red-700';
</script>

<div class="flex h-40 items-center justify-center rounded-lg border-2 {colorClass} p-6">
	<p class="text-3xl font-bold {textColorClass}">
		{message}
	</p>
</div>
