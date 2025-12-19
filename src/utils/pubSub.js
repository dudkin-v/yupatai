import PS from 'PubSub';

export const PubSub = new PS();

export const PUB_SUB_MESSAGES = {
	SHOW_GLOBAL_LOADER: 'show-global-loader',
	HIDE_GLOBAL_LOADER: 'hide-global-loader',
	GLOBAL_LOADER_STATE_UPDATED: 'global-loader-state-updated',
};
