const KONAMI_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function initKonamiCodeDetection(callback: () => void): () => void {
	let sequenceIndex = 0;

	const handleKeyDown = (event: KeyboardEvent) => {
		const key = event.key.toLowerCase() === 'b' || event.key.toLowerCase() === 'a' ? event.key.toLowerCase() : event.code;
		
		if (key === KONAMI_SEQUENCE[sequenceIndex]) {
			sequenceIndex++;
			
			if (sequenceIndex === KONAMI_SEQUENCE.length) {
				callback();
				sequenceIndex = 0;
			}
		} else if (key === KONAMI_SEQUENCE[0]) {
			sequenceIndex = 1;
		} else {
			sequenceIndex = 0;
		}
	};

	globalThis.addEventListener('keydown', handleKeyDown);

	return () => {
		globalThis.removeEventListener('keydown', handleKeyDown);
	};
}
