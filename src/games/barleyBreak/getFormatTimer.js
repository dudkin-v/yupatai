export const getFormatTimer = (timeInSec) => {
	const minutes = Math.floor(timeInSec / 60);
	const seconds = timeInSec % 60;

	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
