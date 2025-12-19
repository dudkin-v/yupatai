import { PubSub, PUB_SUB_MESSAGES } from '../../utils/pubSub.js';

const nav = document.getElementById('navigation');

const GAMES = {
	findTheKid: true,
};

const state = {
	isCalled: false,
	currentGame: null,
};

const gameManager = async (name) => {
	if (!GAMES[name]) {
		return;
	}

	if (state.currentGame?.name === name) {
		state.currentGame.restart();
		return;
	}

	if (state.isCalled) {
		return;
	}

	const start = Date.now();

	state.isCalled = true;
	PubSub.publish(PUB_SUB_MESSAGES.SHOW_GLOBAL_LOADER);

	try {
		if (state.currentGame) {
			state.currentGame.close();
		}

		const game = (await import(`../../games/${name}/${name}.js`)).default;

		if (game) {
			state.currentGame = {
				name,
				...game,
			};

			state.currentGame.render();
		}
	} catch (error) {
		console.log('handleLoadGame error', error);
	}

	const end = Date.now();
	const time = end - start;
	PubSub.publish(PUB_SUB_MESSAGES.HIDE_GLOBAL_LOADER, { delay: Math.max(0, 1500 - time) });
	state.isCalled = false;
};

nav.addEventListener('click', (event) => {
	const item = event.target.closest('[data-value]');

	if (!item) {
		return;
	}

	gameManager(item.dataset.value).catch(() => {});
});
