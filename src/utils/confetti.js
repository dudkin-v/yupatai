import gsap from 'gsap';
import confetti from '@hiseb/confetti';

export const adConfetti = () => {
	const logo = document.getElementById('logo');

	if (logo) {
		const rect = logo.getBoundingClientRect();
		const position = {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		};

		gsap.set(logo, {
			transformOrigin: '50% 50%',
		});

		const tl = gsap.timeline();

		tl.fromTo(
			logo,
			{
				scale: 0,
				rotation: -6,
				opacity: 0,
			},
			{
				scale: 1,
				rotation: 6,
				opacity: 1,
				duration: 0.5,
				ease: 'back.out(1.8)',
			}
		)
			.to(logo, {
				scale: 1.3,
				rotation: 0,
				duration: 0.4,
				ease: 'power2.out',
			})
			.to(logo, {
				scale: 1,
				duration: 0.4,
				ease: 'elastic.out(1, 0.4)',
			})

			.to(logo, {
				rotation: 6,
				duration: 0.15,
				ease: 'power1.inOut',
			})
			.to(logo, {
				rotation: -6,
				duration: 0.3,
				ease: 'power1.inOut',
			})
			.to(logo, {
				rotation: 0,
				duration: 0.2,
				ease: 'power1.out',
			})

			.to(
				logo,
				{
					duration: 0.3,
					yoyo: true,
					repeat: 1,
				},
				'-=0.2'
			);

		tl.add(() => {
			confetti({
				position,
				count: 200,
				size: 2,
				velocity: 200,
			});
		}, '-=0.35');
	} else {
		confetti({
			count: 200,
			size: 2,
			velocity: 200,
		});
	}
};
