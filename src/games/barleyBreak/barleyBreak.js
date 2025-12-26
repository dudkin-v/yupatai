import gsap from 'gsap';
import { PubSub } from '../../utils/pubSub.js';
import { getMain } from '../../utils/dom.js';
import { adConfetti } from '../../utils/confetti.js';
import { getShuffledArrayOfBricks } from './getShuffledArrayOfBricks.js';
import brickHelpers from './brickHelpers.js';
import { getFormatTimer } from './getFormatTimer.js';
import './barleyBreak.scss';

const MESSAGES = {
	STEP_CHANGED: 'step-changed',
	COUNTER_CHANGED: 'counter-changed',
	TIMER_CHANGED: 'timer-changed',
	SIZE_PICKER_ERROR: 'size-picker-error',
};

const STEPS = {
	MAIN: 'main',
	LOADING: 'loading',
	GAME: 'game',
};

const BOARD_SIZES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const defaultState = {
	step: STEPS.MAIN,
	boardSize: null,
	counter: 0,
	timer: 0,
	timerId: null,
	emptyBrickIndex: null,
	isWin: false,
	canMove: true,
	onStepChangeCallbacks: [],
	onCloseCallbacks: [],
	bricksState: {},
};

let state = JSON.parse(JSON.stringify(defaultState));

const resetState = () => {
	state = JSON.parse(JSON.stringify(defaultState));
};

const removeOnStepChangeCallbacks = () => {
	state.onStepChangeCallbacks.forEach((callback) => {
		callback();
	});

	state.onStepChangeCallbacks = [];
};

const removeOnCloseCallbacks = () => {
	state.onCloseCallbacks.forEach((callback) => {
		callback();
	});

	state.onCloseCallbacks = [];
};

const getGameButtons = () => {
	const buttonsContainer = document.createElement('div');
	buttonsContainer.className = 'bb__game-buttons';

	const restartButton = document.createElement('button');
	restartButton.className = 'bb__restart';
	restartButton.innerText = 'Restart';

	restartButton.addEventListener('click', () => {
		PubSub.publish(MESSAGES.STEP_CHANGED, STEPS.LOADING);
	});

	const backButton = document.createElement('button');
	backButton.className = 'bb__back';
	backButton.innerText = 'Back';

	backButton.addEventListener('click', () => {
		PubSub.publish(MESSAGES.STEP_CHANGED, STEPS.MAIN);
	});

	buttonsContainer.append(
		restartButton,
		backButton,
	);

	return {
		element: buttonsContainer,
		remove: () => buttonsContainer.remove(),
	};
};

const canMove = (from, to) => {
	const size = state.boardSize;

	const fromRow = Math.floor(from / size);
	const fromCol = from % size;
	const toRow = Math.floor(to / size);
	const toCol = to % size;

	return (
		(fromRow === toRow && Math.abs(fromCol - toCol) === 1) ||
		(fromCol === toCol && Math.abs(fromRow - toRow) === 1)
	);
};

const swapBricks = (board, fromIndex, toIndex, callback) => {
	const bricks = board.children;
	const fromEl = bricks[fromIndex];
	const toEl = bricks[toIndex];

	const fromRect = fromEl.getBoundingClientRect();
	const toRect = toEl.getBoundingClientRect();

	const dx = toRect.left - fromRect.left;
	const dy = toRect.top - fromRect.top;
	state.canMove = false;

	gsap.to(fromEl, {
		x: dx,
		y: dy,
		duration: 0.2,
		ease: 'power2.out',
		onComplete: () => {
			gsap.set(fromEl, { x: 0, y: 0 });

			const placeholder = document.createElement('div');
			board.replaceChild(placeholder, fromEl);
			board.replaceChild(fromEl, toEl);
			board.replaceChild(toEl, placeholder);
			callback();
		},
	});
};

const drizzle = (element) => {
	gsap.fromTo(
		element,
		{ x: 0, y: 0 },
		{
			x: 4,
			y: -4,
			duration: 0.05,
			ease: 'power1.inOut',
			yoyo: true,
			repeat: 3,
			clearProps: 'x',
		}
	);
};

const getBoard = () => {
	const board = document.createElement('div');
	board.className = 'bb__board';

	board.style.setProperty('--gap', `${brickHelpers.bricksGap}px`);
	board.style.setProperty('--brick-width', brickHelpers.getBrickWidth(state.boardSize));
	board.style.setProperty('--brick-fs', brickHelpers.getFontSize(state.boardSize));

	getShuffledArrayOfBricks(state.boardSize).forEach((brickValue, index) => {
		const brick = document.createElement('div');
		brick.className = 'bb__brick';
		brick.setAttribute('data-value', brickValue.toString());
		const inner = document.createElement('div');

		if (brickValue) {
			const number = document.createElement('div');
			number.innerText = brickValue.toString();

			inner.appendChild(number);

			if (brickValue === index + 1) {
				brick.classList.add('bb__brick--success');
				state.bricksState[brickValue] = true;
			} else {
				state.bricksState[brickValue] = false;
			}
		} else {
			state.emptyBrickIndex = index;
		}

		brick.appendChild(inner);
		board.appendChild(brick);
	});

	board.addEventListener('click', (event) => {
		if (!state.canMove) {
			return;
		}

		const brick = event.target.closest('[data-value]');

		if (!brick) {
			return;
		}

		if (state.isWin) {
			drizzle(brick);
			return;
		}

		const bricks = Array.from(board.children);
		const brickIndex = bricks.indexOf(brick);
		const emptyIndex = state.emptyBrickIndex;
		const brickValue = brick.getAttribute('data-value');

		if (!canMove(brickIndex, emptyIndex)) {
			drizzle(brick);
			return;
		}

		const afterSwap = () => {
			if ((emptyIndex + 1).toString() === brickValue) {
				brick.classList.add('bb__brick--success');
				state.bricksState[brickValue] = true;
			} else {
				brick.classList.remove('bb__brick--success');
				state.bricksState[brickValue] = false;
			}

			state.emptyBrickIndex = brickIndex;
			state.counter++;

			PubSub.publish(MESSAGES.COUNTER_CHANGED);
			state.canMove = true;

			const isWin = !Object.values(state.bricksState).includes(false);

			if (isWin) {
				state.isWin = true;
				adConfetti();
			}
		};

		swapBricks(
			board,
			brickIndex,
			emptyIndex,
			afterSwap,
		);
	});

	return {
		element: board,
		remove: () => board.remove(),
	};
};

const getPlayButon = () => {
	const playButton = document.createElement('button');
	playButton.className = 'bb__play';
	playButton.innerText = `Play`;

	playButton.addEventListener('click', () => {
		if (!state.boardSize) {
			PubSub.publish(MESSAGES.SIZE_PICKER_ERROR);
			return;
		}

		PubSub.publish(MESSAGES.STEP_CHANGED, STEPS.LOADING);
	});

	return {
		element: playButton,
		remove: () => playButton.remove(),
	};
};

const getBoardSizePicker = () => {
	const container = document.createElement('div');
	container.className = 'bb__buttons-container';

	const buttons = document.createElement('div');
	buttons.className = 'bb__buttons';

	BOARD_SIZES.forEach((size) => {
		const button = document.createElement('button');
		button.className = 'bb__button';
		button.innerText = `${size} x ${size}`;
		const sizeValue = size.toString();

		if (state.boardSize === sizeValue) {
			button.classList.add('bb__button--selected');
		}

		button.setAttribute('data-size', sizeValue);
		buttons.appendChild(button);
	});

	buttons.addEventListener('click', (event) => {
		const button = event.target.closest('[data-size]');

		if (!button) {
			return;
		}

		if (state.boardSize) {
			const prevSelectedButton = buttons.querySelector(`[data-size="${state.boardSize}"]`);

			if (prevSelectedButton) {
				prevSelectedButton.classList.remove('bb__button--selected');
			}
		}

		state.boardSize = button.getAttribute('data-size');
		state.boardSizeSelectedButton = button;
		button.classList.add('bb__button--selected');
	});

	const onSizePickerError = PubSub.subscribe(MESSAGES.SIZE_PICKER_ERROR, () => {
		drizzle(container);
	});

	container.appendChild(buttons);

	return {
		element: container,
		remove: () => {
			container.remove();
			state.onStepChangeCallbacks.push(() => PubSub.unsubscribe(onSizePickerError));
		},
	};
};

const getTimer = () => {
	const timer = document.createElement('div');
	timer.className = 'bb__timer';
	timer.innerText = getFormatTimer(state.timer);

	const onChangeTimer = PubSub.subscribe(MESSAGES.TIMER_CHANGED, () => {
		timer.innerText = getFormatTimer(state.timer);
	});

	return {
		element: timer,
		remove: () => {
			timer.remove();
			state.onStepChangeCallbacks.push(() => PubSub.unsubscribe(onChangeTimer));
		},
	};
};

const getCounter = () => {
	const counter = document.createElement('div');
	counter.className = 'bb__counter';
	counter.innerText = state.counter.toString();

	const onChangeCounter = PubSub.subscribe(MESSAGES.COUNTER_CHANGED, () => {
		counter.innerText = state.counter.toString();
	});

	return {
		element: counter,
		remove: () => {
			counter.remove();
			state.onStepChangeCallbacks.push(() => PubSub.unsubscribe(onChangeCounter));
		},
	};
};

const getLoader = (onEnd) => {
	const loader = document.createElement('div');
	loader.className = 'bb__loader';

	const bar = document.createElement('div');
	bar.className = 'bb__loader-bar';

	loader.appendChild(bar);

	gsap.fromTo(
		bar,
		{ scaleX: 0 },
		{
			scaleX: 1,
			duration: 1.5,
			ease: 'linear',
			transformOrigin: 'left center',
			onComplete: () => {
				loader.remove();
				onEnd();
			},
		}
	);

	return {
		element: loader,
		remove: () => loader.remove(),
	};
};

const stepRenderers = {
	[STEPS.MAIN]: (container) => {
		const boardSizePicker = getBoardSizePicker();
		const playButtons = getPlayButon();

		state.onStepChangeCallbacks.push(boardSizePicker.remove);
		state.onStepChangeCallbacks.push(playButtons.remove);

		container.append(
			boardSizePicker.element,
			playButtons.element,
		);
	},
	[STEPS.LOADING]: (container) => {
		const loader = getLoader(() => PubSub.publish(MESSAGES.STEP_CHANGED, STEPS.GAME));

		state.onStepChangeCallbacks.push(loader.remove);
		container.append(loader.element);
	},
	[STEPS.GAME]: (container) => {
		state.timer = defaultState.timer;
		state.counter = defaultState.counter;
		state.canMove = defaultState.canMove;
		state.isWin = defaultState.isWin;
		state.bricksState = {};

		const gameButtons = getGameButtons();
		const board = getBoard();
		const counter = getCounter();
		const timer = getTimer();

		state.onStepChangeCallbacks.push(gameButtons.remove);
		state.onStepChangeCallbacks.push(board.remove);
		state.onStepChangeCallbacks.push(counter.remove);
		state.onStepChangeCallbacks.push(timer.remove);

		container.append(
			gameButtons.element,
			board.element,
			counter.element,
			timer.element,
		);

		if (state.timerId) {
			clearInterval(state.timerId);
		}

		const intervalId = setInterval(() => {
			if (state.isWin) {
				return;
			}

			state.timer++;
			PubSub.publish(MESSAGES.TIMER_CHANGED);
		}, 1000);

		state.onStepChangeCallbacks.push(() => clearInterval(intervalId));
	},
};

const render = () => {
	const main = getMain();

	const gameContainer = document.createElement('div');
	gameContainer.className = 'bb';
	main.appendChild(gameContainer);
	const stepRenderer = stepRenderers[state.step];

	if (stepRenderer) {
		stepRenderer(gameContainer);
	}

	const onStepChange = PubSub.subscribe(MESSAGES.STEP_CHANGED, (newStep) => {
		if (newStep === state.step) {
			return;
		}

		removeOnStepChangeCallbacks();
		state.step = newStep;
		const stepRenderer = stepRenderers[state.step];

		if (stepRenderer) {
			stepRenderer(gameContainer);
		}
	});

	state.onCloseCallbacks.push(() => PubSub.unsubscribe(onStepChange));
	state.onCloseCallbacks.push(() => gameContainer.remove());
};

const close = () => {
	removeOnStepChangeCallbacks();
	removeOnCloseCallbacks();
	resetState();
};

const restart = () => {
	close();
	render();
};

export default {
	render,
	close,
	restart,
};
