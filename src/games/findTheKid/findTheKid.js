import gsap from 'gsap';
import { PubSub } from '../../utils/pubSub.js';
import { adConfetti } from '../../utils/confetti.js';
import boxImage from './box.png';
import openedBoxImage from './box-opened.png';
import kidImage from './kid.png';
import leaveIcon from './leaveIcon.png';
import './find-the-kid.scss';

const MESSAGES = {
	BOX_OPEN: 'box-open',
};

const BOXES_COUNT = 12;
const LEAVES_COUNT = 5;

const defaultState = {
	leaves: LEAVES_COUNT,
	isRestarting: false,
	canOpenBox: true,
	eventListeners: [],
	onCloseCallbacks: [],
};

let state = JSON.parse(JSON.stringify(defaultState));

const removeEventListeners = () => {
	state.eventListeners.forEach((listener) => {
		listener.target.removeEventListener(listener.event, listener.callback);
	});

	state.eventListeners = [];
};

const removeOnCloseCallbacks = () => {
	state.onCloseCallbacks.forEach((callback) => {
		callback();
	});

	state.onCloseCallbacks = [];
};

const addEventListener = (target, event, callback, options = {}) => {
	target.addEventListener(event, callback, options);

	if (!options.once) {
		state.eventListeners.push({
			target,
			event,
			callback,
		});
	}
};

const boxIdleAnimation = (box) => {
	return gsap.to(box, {
		y: gsap.utils.random(-8, 8),
		x: gsap.utils.random(-8, 8),
		rotation: gsap.utils.random(-1.5, 1.5),
		duration: gsap.utils.random(2, 4),
		repeat: -1,
		yoyo: true,
		ease: 'sine.inOut',
		delay: gsap.utils.random(0, 1.5),
	});
};

const openBox = (props) => {
	const {
		box,
		image,
		inner,
	} = props;

	if (!state.canOpenBox) {
		return;
	}

	state.canOpenBox = false;
	box._boxIdleAnimation.kill();
	box.style.pointerEvents = 'none';

	gsap.timeline().to(box,
		{
			x: -6,
			rotation: -2,
			duration: 0.05,
			repeat: 5,
			yoyo: true,
			ease: 'power1.inOut',
		})
		.to(box, {
			scale: 1.1,
			duration: 0.4,
			ease: 'bounce.out',
			onStart: () => {
				box.classList.add('box--opened');
				image.src = openedBoxImage;
				state.leaves = Math.max(0, state.leaves - 1);
				PubSub.publish(MESSAGES.BOX_OPEN);

				switch (inner) {
					case 'kid':
						const image = document.createElement('img');
						image.src = kidImage;
						image.alt = 'kid';
						image.className = 'box__kid';
						box.appendChild(image);
						box.classList.add('box--success');

						break;
					case 'empty':
						box.classList.add('box--wrong');
						break;
					default:
						break;
				}
			},
		})
		.to(box, {
			scale: 1,
			duration: 0.2,
			onComplete: () => {
				if (inner === 'kid') {
					adConfetti();
					return;
				}

				if (!state.leaves) {
					alert('You loose, try again!');
					return;
				}

				state.canOpenBox = true;
			},
		});
};

const createBox = (props) => {
	const {
		order,
		inner,
	} = props;

	const container = document.createElement('div');
	container.className = 'box';
	container._boxIdleAnimation = boxIdleAnimation(container);

	const image = document.createElement('img');
	image.src = boxImage;
	image.alt = 'box';
	container.appendChild(image);

	addEventListener(
		container,
		'click',
		() => openBox({ box: container, image, inner }),
	);

	addEventListener(
		container,
		'mouseenter',
		() => {
			if (state.leaves) {
				gsap.to(container, { scale: 1.05, duration: 0.2 });
			} else {
				container.style.pointerEvents = 'none';
			}
		}
	);

	addEventListener(
		container,
		'mouseleave',
		() => {
			if (state.leaves) {
				gsap.to(container, { scale: 1, duration: 0.2 });
			} else {
				container.style.pointerEvents = 'none';
			}
		}
	);

	gsap.from(container, {
		scale: state.isRestarting ? 0.9 : 0.5,
		duration: 0.7,
		delay: (state.isRestarting ? 0 : 1.2) + order / 10,
		ease: 'back.inOut',
	});

	return container;
};

const getBoxes = () => {
	const emptyBoxed = Array.from({length: BOXES_COUNT});
	const kidIndex = Math.floor(Math.random() * BOXES_COUNT);

	const boxesContainer = document.createElement('div');
	boxesContainer.className = 'boxes';

	emptyBoxed.forEach((_, index) => {
		const box = createBox({
			order: index + 1,
			inner: index === kidIndex ? 'kid' : 'empty',
		});

		boxesContainer.appendChild(box);
	});

	return {
		element: boxesContainer,
		remove: () => {
			boxesContainer.remove();
		},
	};
};

const getHeader = () => {
	const header = document.createElement('div');
	header.className = 'f-header';

	const leaves = document.createElement('div');
	leaves.className = 'f-header__leaves';

	for (let i = 1; i <= LEAVES_COUNT; i++) {
		const leaveImage = document.createElement('img');
		leaveImage.className = 'f-header__leave';
		leaveImage.src = leaveIcon;
		leaveImage.alt = 'leave';
		leaves.appendChild(leaveImage);
	}

	const pubSubscriptionId = PubSub.subscribe(MESSAGES.BOX_OPEN, () => {
		leaves.childNodes.forEach((leaveImage, index) => {
			if (index + 1 > state.leaves) {
				leaveImage.classList.add('f-header__leave--empty');
			}
		});
	});

	header.appendChild(leaves);

	return {
		element: header,
		remove: () => {
			PubSub.unsubscribe(pubSubscriptionId);
			header.remove();
		},
	};
};

const render = (container) => {
	const gameContainer = document.createElement('div');
	gameContainer.className = 'ftk';

	const header = getHeader();
	const boxes = getBoxes();

	state.onCloseCallbacks.push(header.remove);
	state.onCloseCallbacks.push(boxes.remove);

	gameContainer.append(
		header.element,
		boxes.element,
	);

	container.appendChild(gameContainer);
	state.onCloseCallbacks.push(() => gameContainer.remove());
};

const close = () => {
	removeEventListeners();
	removeOnCloseCallbacks();
	state = JSON.parse(JSON.stringify(defaultState));
};

const restart = (container) => {
	close();
	state.isRestarting = true;
	render(container);
};

export default {
	render,
	close,
	restart,
};
