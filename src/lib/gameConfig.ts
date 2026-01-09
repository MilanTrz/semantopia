export type GameConfig = {
	slug: string;
	label: string;
	icon: string;
	gradient: string;
	description: string;
};

export const GAMES: GameConfig[] = [
	{ 
		slug: 'cemantix', 
		label: 'Cémantix', 
		icon: 'fa-brain', 
		gradient: 'from-pink-600 via-rose-500 to-orange-400',
		description: 'Trouvez le mot mystère grâce aux associations sémantiques et à votre grande intellecte'
	},
	{ 
		slug: 'pedantix', 
		label: 'Pédantix', 
		icon: 'fa-book-open', 
		gradient: 'from-blue-700 via-blue-500 to-cyan-400',
		description: 'Découvrez l\'article Wikipédia caché mot par mot dans ce jeu de déduction'
	},
	{ 
		slug: 'motix', 
		label: 'Motix', 
		icon: 'fa-keyboard', 
		gradient: 'from-emerald-600 via-green-500 to-lime-400',
		description: 'Deviner le mot mystère en construisant d\'autres mots du même nombre de lettres.'
	},
	{ 
		slug: 'correlix', 
		label: 'Corrélix', 
		icon: 'fa-project-diagram', 
		gradient: 'from-orange-600 via-amber-500 to-yellow-400',
		description: 'Trouvez les mots liés par des corrélations surprenantes et logiques'
	},
	{ 
		slug: 'lettix', 
		label: 'Lettix', 
		icon: 'fa-bolt', 
		gradient: 'from-violet-600 via-fuchsia-500 to-pink-300',
		description: 'Trouvez un maximum d\'anagrammes en 60 secondes'
	},
	{ 
		slug: 'mimix', 
		label: 'Mimix', 
		icon: 'fa-question', 
		gradient: 'from-rose-700 via-red-500 to-orange-300',
		description: 'Trouvez le plus de fois l\'intrus parmi les 4 propositions'
	},
	{ 
		slug: 'panix', 
		label: 'Panix', 
		icon: 'fa-shuffle', 
		gradient: 'from-lime-600 via-lime-400 to-green-300',
		description: 'Créer un mot avec des lettres imposées et qui doivent être collées en 60 secondes'
	},
	{ 
		slug: 'chainix', 
		label: 'Chainix', 
		icon: 'fa-link', 
		gradient: 'from-teal-600 via-cyan-500 to-sky-400',
		description: 'Enchaînez des mots où chaque fin devient le début du suivant en 60 secondes.'
	}
];

export function getGameConfig(slug: string): GameConfig | undefined {
	return GAMES.find(g => g.slug === slug);
}

export function getOtherGames(excludeSlug: string): GameConfig[] {
	return GAMES.filter(g => g.slug !== excludeSlug);
}

export function getTotalGameTypes(): number {
	return GAMES.length;
}