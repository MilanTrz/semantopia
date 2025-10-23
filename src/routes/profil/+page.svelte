<script lang="ts">
	import { sessionStore } from '$lib/store/sessionStore';
	import Header from '$lib/header.svelte';
	import { onMount } from 'svelte';
	let session = sessionStore.get();
	let pseudoUser: string | null = session ? session.pseudo : null;
	let email: string | null = session ? session.email : null;
	const avatar: string | null = session ? session.avatar : null;
	const date: Date | null = session ? session.dateCreation : null;
	let partiesJouees: number = 0;
	let tauxReussite: number = 0;
</script>

<Header />
<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-7xl px-4">
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<aside class="lg:col-span-1">
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<div class="flex flex-col items-center text-center">
						<img src={avatar} alt="photo_profil" class="mb-4 h-24 w-24 rounded-full object-cover" />
						<h3 class="mb-1 text-xl font-bold text-gray-900">{pseudoUser}</h3>
						<p class="mb-6 text-sm text-gray-500">Membre depuis {date}</p>
					</div>
				</div>
			</aside>

			<section class="lg:col-span-2">
				<div class="space-y-6">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="rounded-lg bg-white p-6 shadow-sm">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium text-gray-500">Parties jouées</p>
									<h3 class="mt-2 text-3xl font-bold text-gray-900">{partiesJouees}</h3>
								</div>
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
									<svg
										class="h-6 w-6 text-blue-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
							</div>
						</div>

						<div class="rounded-lg bg-white p-6 shadow-sm">
							<div class="mb-4 flex items-center justify-between">
								<div class="flex-1">
									<p class="text-sm font-medium text-gray-500">Taux de réussite</p>
									<h3 class="mt-2 text-3xl font-bold text-gray-900">{tauxReussite}%</h3>
								</div>
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
									<svg
										class="h-6 w-6 text-green-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
							</div>
							<div class="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
								<div
									class="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
									style="width: {tauxReussite}%"
								></div>
							</div>
						</div>
					</div>

					<div class="rounded-lg bg-white p-6 shadow-sm">
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-lg font-semibold text-gray-900">Historique des parties</h3>
						</div>
						<div class="space-y-3"></div>
					</div>

					<div class="rounded-lg bg-white p-6 shadow-sm">
						<h3 class="mb-6 text-lg font-semibold text-gray-900">Paramètres du compte</h3>
						<form class="space-y-5">
							<div>
								<label for="pseudo" class="mb-2 block text-sm font-medium text-gray-700">
									Pseudonyme
								</label>
								<input
									id="pseudo"
									type="text"
									bind:value={pseudoUser}
									placeholder="Votre pseudo"
									class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
									Adresse email
								</label>
								<input
									id="email"
									type="email"
									bind:value={email}
									placeholder="votre@email.com"
									class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
									Mot de passe
								</label>
								<button
									type="button"
									class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
										/>
									</svg>
									Modifier le mot de passe
								</button>
							</div>

							<button
								type="submit"
								class="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
							>
								Sauvegarder les modifications
							</button>
						</form>
					</div>
				</div>
			</section>
		</div>
	</div>
</div>
