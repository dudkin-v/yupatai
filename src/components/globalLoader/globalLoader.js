import { PubSub, PUB_SUB_MESSAGES } from '../../utils/pubSub.js';
import { setTimer } from '../../utils/timer.js';
import './global-loader.scss';

const LOADER_ELEMENT_ID = 'global-loader';
const LOADER_ELEMENT_CLASS_NAMES = {
	DEFAULT: 'global-loader',
	VISIBLE: 'global-loader--visible',
	HIDDEN: 'global-loader--hidden',
};

const state = {
	isVisible: false,
};

const getLoaderElement = () => {
	let loader = document.getElementById(LOADER_ELEMENT_ID);

	if (!loader) {
		loader = document.createElement('div');
		loader.classList.add(LOADER_ELEMENT_CLASS_NAMES.DEFAULT);
		loader.id = LOADER_ELEMENT_ID;
		loader.innerHTML = `
			<div class="global-loader__left"><span>Yupatai</span></div>
			<div class="global-loader__right"><span>Yupatai</span></div>
		`;

		document.body.appendChild(loader);
	}

	return loader;
};

const hideGlobalLoader = ({delay = 0} = {}) => {
	if (!state.isVisible) {
		return;
	}

	const loader = getLoaderElement();

	const hide = () => {
		loader.classList.add(LOADER_ELEMENT_CLASS_NAMES.HIDDEN);
		loader.classList.remove(LOADER_ELEMENT_CLASS_NAMES.VISIBLE);

		setTimer(
			'gl-animation',
			() => {
				state.isVisible = false;
				PubSub.publish(PUB_SUB_MESSAGES.GLOBAL_LOADER_STATE_UPDATED, { ...state });
			},
			300,
		);
	};

	if (delay) {
		setTimer('gl-hide', hide, delay);
	} else {
		hide();
	}
};

const showGlobalLoader = ({duration, animate = true} = {}) => {
	if (state.isVisible) {
		return;
	}

	state.isVisible = true;
	PubSub.publish(PUB_SUB_MESSAGES.GLOBAL_LOADER_STATE_UPDATED, { ...state });

	const loader = getLoaderElement();

	loader.style.setProperty('--left-from', animate ? '0' : '-110%');
	loader.style.setProperty('--right-from', animate ? '0' : '110%');
	loader.classList.add(LOADER_ELEMENT_CLASS_NAMES.VISIBLE);
	loader.classList.remove(LOADER_ELEMENT_CLASS_NAMES.HIDDEN);

	if (duration) {
		setTimer('gl-show', hideGlobalLoader, Math.max(1500, duration));
	}
};

PubSub.subscribe(PUB_SUB_MESSAGES.HIDE_GLOBAL_LOADER, hideGlobalLoader);
PubSub.subscribe(PUB_SUB_MESSAGES.SHOW_GLOBAL_LOADER, showGlobalLoader);
