import pool from '$lib/server/db';
import { endGameSession } from '$lib/utils/gameSession';
import type { RequestEvent } from '@sveltejs/kit';

const activeSessions: Map<
	string,
	{
		startingWord: string;
	}
> = new Map();

// Liste de mots français courants pour démarrer une chaîne
const starterWords = [
	'animal', 'arbre', 'atlas', 'avion',
	'bateau', 'belle', 'bibliotheque', 'blanc', 'bleu', 'bois', 'bombe', 'bonheur', 'bouche', 'boulangerie', 'bourse', 'branche', 'brave', 'brique', 'bronze', 'brume',
	'cabane', 'cache', 'cadeau', 'cafe', 'cage', 'caisse', 'calme', 'camion', 'campagne', 'canal', 'canape', 'candidat', 'canne', 'canon', 'cante', 'capacite', 'cape', 'capital', 'capitaine', 'capitale', 'caque', 'caractere', 'carbone', 'carburant', 'carcasse', 'carcel', 'cardamome', 'cardinal', 'care', 'careau', 'carence', 'carence', 'caresse', 'cargaison', 'cargue', 'caribou', 'carie', 'carillon', 'cariste', 'carlingue', 'carmel', 'carmelite', 'carnage', 'carnaval', 'carne', 'carneau', 'carnet', 'carnivore', 'carnosite', 'carnute', 'carol', 'carole', 'carolin', 'caroline', 'caronade', 'carone', 'caronna', 'carosse', 'carotte', 'carouge', 'carougeoise', 'carouge', 'carouser', 'carouse', 'caroussement', 'carousse', 'caroussell', 'carousselle', 'caroute', 'carpaccio', 'carpathe', 'carpelle', 'carpenter', 'carpette', 'carpien', 'carpienn', 'carpillon', 'carpio', 'carpogene', 'carpogonie', 'carpogonium', 'carpogone', 'carpographe', 'carpographie', 'carpolite', 'carpologue', 'carpologie', 'carpomance', 'carpomancien', 'carpometacarpe', 'carpometacarpin', 'carpometacarpus', 'carpometre', 'carpometrie', 'carpomorphe', 'carponose', 'carpoperide', 'carpophage', 'carpophile', 'carpophora', 'carpophore', 'carpophyll', 'carpophylle', 'carpophyllaire', 'carpostat', 'carpostasis', 'carpostele', 'carpostyle', 'carpotaxie', 'carpotheca', 'carpothecaire', 'carpothecal', 'carpotheque', 'carpotheque', 'carpozoon', 'carppuches', 'carpre', 'carpuche', 'carquais', 'carquoise', 'carquoiserie', 'carquoisier', 'carr', 'carrache', 'carracoes', 'carracque', 'carracquies', 'carrade', 'carradino', 'carradou', 'carragane', 'carragano', 'carraganine', 'carraganose', 'carrage', 'carrageen', 'carrageenan', 'carrageeninose', 'carragee', 'carragee', 'carragee', 'carragenate', 'carragene', 'carragene', 'carragenin', 'carragenine', 'carragenine', 'carragenine', 'carrageninate', 'carragenose', 'carraghen', 'carragheen', 'carragheen', 'carrai', 'carraidal', 'carraie', 'carraies', 'carraille', 'carraion', 'carraire', 'carraison', 'carral', 'carralaine', 'carralis', 'carralix', 'carrallodge', 'carraloign', 'carralongo', 'carram', 'carramelle', 'carramelli', 'carramillo', 'carramique', 'carrampele', 'carrampion', 'carrampon', 'carramut', 'carramutico', 'carramy', 'carrana', 'carranach', 'carrance', 'carrangaine', 'carrangal', 'carrangon', 'carrangue', 'carranguet', 'carrangunete', 'carrani', 'carrania', 'carranide', 'carranier', 'carranilla', 'carrano', 'carrans', 'carrant', 'carrante', 'carranu', 'carranza', 'carranzac', 'carranzai', 'carranzas', 'carrao', 'carrap', 'carrapache', 'carrapachie', 'carrapachiste', 'carrapachite', 'carrapachol', 'carrapai', 'carrapais', 'carrapajo', 'carrapal', 'carrapale', 'carrapan', 'carrapancho', 'carrapanchudo', 'carrapanchuela', 'carrapancos', 'carrapandera', 'carrapanderia', 'carrapander', 'carrapandero', 'carrapandija', 'carrapandijo', 'carrapandilla', 'carrapandilla', 'carrapandillazo', 'carrapandillejo', 'carrapandillejo', 'carrapandilla', 'carrapandillada', 'carrapandillaje', 'carrapandillajon', 'carrapandillal', 'carrapandillala', 'carrapandillar', 'carrapandillara', 'carrapandillarada', 'carrapandillarado', 'carrapandillarado', 'carrapandillarador', 'carrapandillaradora', 'carrapandillarador', 'carrapandillaradora', 'carrapandillaradora', 'carrapandillarada', 'carrapandillarada', 'carrapandillaradora', 'carrapandillaradora', 'carrapandillarias', 'carrapandillarias', 'carrapandillaría', 'carrapandillario', 'carrapandillaria', 'carrapandillaria', 'carrapandillariedad', 'carrapandillaridad', 'carrapandillaridad', 'carrapandillaridad', 'carrapandillar', 'carrapandillar', 'carrapandillar', 'carrapandillar', 'carrapandillar', 'carrapandillera', 'carrapandilleria', 'carrapandilleria', 'carrapandilleria', 'carrapandilleria', 'carrapandilleria', 'carrapandilleria', 'carrapandilleria', 'carrapandilleria', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería', 'carrapandillería'
];
let poolStarterWords: string[] = [];

function randomStarterWord(): string {
	if (poolStarterWords.length === 0) {
		poolStarterWords = [...starterWords];
	}
	const index = Math.floor(Math.random() * poolStarterWords.length);
	return poolStarterWords.splice(index, 1)[0];
}

export async function GET({ url }: RequestEvent) {
	const userId = Number(url.searchParams.get('userId'));
	try {
		const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const startingWord = randomStarterWord();
		activeSessions.set(sessionId, {
			startingWord: startingWord
		});
		const date = new Date();
		if (userId !== 0) {
			await pool.query(
				'INSERT INTO GAME_SESSION(DATE_PARTIE,EN_COURS,NOMBRE_ESSAI,TYPE,WIN,USER_ID) VALUES(?,1,0,"chainix",0,?) ',
				[date, userId]
			);
		}
		return new Response(JSON.stringify({ startingWord, sessionId }), {
			status: 200
		});
	} catch (error) {
		console.error('Erreur /game/chainix :', error);
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}

	export async function POST({ request }: RequestEvent) {
	const { userGuess, sessionId, action, currentLastWord } = await request.json();
	const session = activeSessions.get(sessionId);

	if (action === 'skipLetters') {
		const startingWord = randomStarterWord();
		activeSessions.set(sessionId, {
			startingWord: startingWord
		});
		return new Response(JSON.stringify({ message: 'Mot changer', startingWord }), {
			status: 200
		});
	}

	if (!session) {
		return new Response(JSON.stringify({ message: 'Session introuvable.' }), { status: 400 });
	}

	let isValid: boolean = false;
	let timeBonus: number = 0;

	const normalize = (word: string): string =>
		word
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.trim()
			.toLowerCase();

	const lastWord = normalize(currentLastWord);
	const guess = normalize(userGuess);

	// Autoriser un chainage sur les 2 ou 3 dernières lettres
	const suffixes: string[] = [];
	if (lastWord.length >= 2) suffixes.push(lastWord.slice(-2));
	if (lastWord.length >= 3) suffixes.push(lastWord.slice(-3));

	const matchesChain = suffixes.some((s) => guess.startsWith(s));

	if (matchesChain && (await checkWordExist(guess))) {
		isValid = true;
		// Bonus de temps en fonction de la longueur
		timeBonus = userGuess.length <= 5 ? 2 : userGuess.length <= 8 ? 3 : 4;
	}

	return new Response(
		JSON.stringify({ message: isValid ? 'Mot valide' : 'Mot invalide', isValid, timeBonus }),
		{ status: 200 }
	);
}

export async function PUT({ request }: RequestEvent) {
	const { sessionId, idUser, chainLength } = await request.json();
	const session = activeSessions.get(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ message: 'Session introuvable.' }), { status: 400 });
	}
	try {
        await endGameSession(idUser, 'chainix', chainLength, true);
		activeSessions.delete(sessionId);
        return new Response(null, { status: 204 });
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}

async function checkWordExist(word: string) {
	const normalize = (word: string): string => {
		return word
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.trim()
			.toLowerCase();
	};
	const normalizeWord = normalize(word);
	const response = await fetch('http://localhost:5000/api/check-word', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			word: normalizeWord
		})
	});
	const data = await response.json();
	const isCorrectWord = data.exists;
	return isCorrectWord;
}
