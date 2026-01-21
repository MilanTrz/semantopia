<script lang="ts">
	type Props = {
		isGameOver: boolean;
		gradient: string;
		onNewGame: () => void;
		onSurrender?: () => void;
		onShare?: () => void;
		surrenderDisabled?: boolean;
		additionalButtons?: Array<{ label: string; onClick: () => void; gradient: string; disabled?: boolean }>;
	};

	let { isGameOver, gradient, onNewGame, onSurrender, onShare, surrenderDisabled = false, additionalButtons = [] }: Props = $props();
</script>

<div class="flex gap-4">
	{#if !isGameOver}
		{#each additionalButtons as button}
			<button
				class="rounded-lg bg-gradient-to-r {button.gradient} px-6 py-3 font-medium text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
				onclick={button.onClick}
				disabled={button.disabled}
			>
				{button.label}
			</button>
		{/each}
		
		{#if onSurrender}
			<button
				class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
				onclick={onSurrender}
				disabled={surrenderDisabled}
			>
				🏳️ Abandonner
			</button>
		{/if}
	{:else}
		<button
			class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
			onclick={onNewGame}
		>
			🔄 Nouvelle partie
		</button>
		{#if onShare}
			<button
				class="flex-1 rounded-lg bg-gradient-to-r {gradient} px-6 py-3 font-medium text-white transition hover:shadow-lg"
				onclick={onShare}
			>
				📤 Partager résultat
			</button>
		{/if}
	{/if}
</div>
