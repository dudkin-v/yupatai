import { PubSub, PUB_SUB_MESSAGES } from '../../utils/pubSub.js';

PubSub.subscribe(PUB_SUB_MESSAGES.GLOBAL_LOADER_STATE_UPDATED, (state) => {
	if (state.isVisible) {
		document.getElementById('header').classList.remove('header--visible');
		document.getElementById('main').classList.remove('main--visible');
		document.getElementById('footer').classList.remove('footer--visible');
	} else {
		document.getElementById('header').classList.add('header--visible');
		document.getElementById('main').classList.add('main--visible');
		document.getElementById('footer').classList.add('footer--visible');
	}
});
