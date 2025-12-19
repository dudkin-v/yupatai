const timers = {};

export const setTimer = (key, callback, delay) => {
	if (timers[key]) {
		clearTimeout(timers[key]);
	}

	timers[key] = setTimeout(callback, delay);
};

export const removeAlTimers = () => {
	Object.keys(timers).forEach((key) => {
		clearTimeout(timers[key]);
	});
};