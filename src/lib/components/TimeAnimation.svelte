<script lang="ts">
	type Props = {
		show: boolean;
		value: number;
	};

	let { show, value }: Props = $props();
</script>

{#if show}
	<span
		class="animate-bounce-up text-3xl font-bold {value > 0 ? 'text-green-600' : 'text-red-600'}"
	>
		{value > 0 ? '+' : ''}{value}s
	</span>
{/if}

<style>
	@keyframes bounce-up {
		0% {
			opacity: 0;
			transform: translateY(0);
		}
		50% {
			opacity: 1;
			transform: translateY(-20px);
		}
		100% {
			opacity: 0;
			transform: translateY(-40px);
		}
	}

	.animate-bounce-up {
		animation: bounce-up 1s ease-out;
	}
</style>
