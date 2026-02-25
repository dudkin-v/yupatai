import { PubSub, PUB_SUB_MESSAGES } from '../../utils/pubSub.js';
import { getMain } from '../../utils/dom.js';
import './navigation.scss';

const GAMES = {
	findTheKid: {
		name: 'Find the kid',
	},
	barleyBreak: {
		name: 'Barley break',
	},
};

const state = {
	isCalled: false,
	timerId: null,
	currentGame: null,
	gamesMenu: null,
};

const main = getMain();
const logo = document.getElementById('logo');
const currentGameContainer = document.getElementById('current-game');

const gameManager = async (name) => {
	if (!GAMES[name]) {
		return;
	}

	if (state.isCalled) {
		return;
	}

	const start = Date.now();

	state.isCalled = true;
	PubSub.publish(PUB_SUB_MESSAGES.SHOW_GLOBAL_LOADER);

	try {
		const game = (await import(`../../games/${name}/${name}.js`)).default;

		if (game) {
			if (state.currentGame) {
				state.currentGame.close();
			}

			if (state.gamesMenu) {
				state.gamesMenu.remove();
				state.gamesMenu = null;
			}

			state.currentGame = {
				name,
				...game,
			};
		} else {
			console.log(`Can not load the game ${name}`);
		}
	} catch (error) {
		console.log(`Can not load the game ${name}`);
	}

	const end = Date.now();
	const time = end - start;

	if (state.timerId) {
		clearTimeout(state.timerId);
	}

	state.timerId = setTimeout(() => {
		state.currentGame.render(main);

		if (currentGameContainer) {
			currentGameContainer.innerText = GAMES[name].name;
		}
	}, 400);

	PubSub.publish(PUB_SUB_MESSAGES.HIDE_GLOBAL_LOADER, { delay: Math.max(0, 1500 - time) });
	state.isCalled = false;
};

const getGamesMenu = () => {
	const menu = document.createElement('ul');
	menu.className = 'games';

	Object.keys(GAMES).forEach((key) => {
		const game = GAMES[key];
		const menuItem = document.createElement('li');

		menuItem.className = 'games__item';
		menuItem.setAttribute('data-value', key);
		menuItem.innerText = game.name;
		menu.appendChild(menuItem);
	});

	const testLinks = [
		`https://app.vogacloset.com${window.location.pathname}?itd=1226968214`,
		`vogaclosetapp://n${location.pathname}${location.search}`,
		'itms-apps://itunes.apple.com/us/app/id1226968215'
	];

	testLinks.forEach((link, index) => {
		const linkItem = document.createElement('li');

		linkItem.className = 'games__item';
		linkItem.setAttribute('data-link', link);
		linkItem.innerText = `Link ${index + 1}`;
		menu.appendChild(linkItem);
	});

	menu.addEventListener('click', (event) => {
		const item = event.target.closest('[data-value]')
		const link = event.target.closest('[data-link]')

		if (link) {
			window.location = link.dataset.link;
		}

		if (item) {
			gameManager(item.dataset.value).catch(() => {});
		}
	});

	return {
		element: menu,
		remove: () => menu.remove(),
	};
};

const gamesMenu = getGamesMenu()
state.gamesMenu = gamesMenu
main.appendChild(gamesMenu.element)

if (logo) {
	logo.addEventListener('click', () => {
		if (state.gamesMenu) {
			return;
		}

		PubSub.publish(PUB_SUB_MESSAGES.SHOW_GLOBAL_LOADER, { duration: 1500 });

		if (state.timerId) {
			clearTimeout(state.timerId);
		}

		state.timerId = setTimeout(() => {
			if (state.currentGame) {
				state.currentGame.close();
			}

			if (currentGameContainer) {
				currentGameContainer.innerText = '';
			}

			const gamesMenu = getGamesMenu();
			state.gamesMenu = gamesMenu;

			main.appendChild(gamesMenu.element);
		}, 400);
	});
}

if (currentGameContainer) {
	currentGameContainer.addEventListener('click', () => {
		if (state.currentGame) {
			state.currentGame.restart(main);
		}
	});
}
