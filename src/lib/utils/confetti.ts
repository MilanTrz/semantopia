import confetti from 'canvas-confetti';

export function triggerConfettiAnimation(duration: number = 4000): void {
	const animationEnd = Date.now() + duration;
	const defaults = {
		startVelocity: 30,
		spread: 360,
		ticks: 60,
		zIndex: 1000
	};

	const interval = setInterval(() => {
		const timeLeft = animationEnd - Date.now();

		if (timeLeft <= 0) {
			clearInterval(interval);
			return;
		}

		const particleCount = 50 * (timeLeft / duration);
		confetti({
			...defaults,
			particleCount,
			origin: {
				x: Math.random(),
				y: Math.random() * 0.5
			},
			colors: ['#bb0000', '#ffffff', '#ffcc00', '#00bbff']
		});
	}, 250);
}
