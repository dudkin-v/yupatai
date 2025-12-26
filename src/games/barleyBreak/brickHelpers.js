const getFontSize = (boardSize) => {
	const minCount = 4;
	const maxCount = 100;
	const minSize = 6;
	const maxSize = 2;

	const clamped = Math.min(Math.max(boardSize * boardSize, minCount), maxCount);

	return `${Math.floor(
		minSize +
		(maxSize - minSize) *
		((clamped - minCount) / (maxCount - minCount))
	)}cqw`;
};

const BRICKS_GAP = 12;

const getBrickWidth = (boardSize) => {
	const gap = (boardSize - 1) * BRICKS_GAP / boardSize;
	return `calc(${100 / boardSize}% - ${gap}px)`;
};

export default {
	bricksGap: BRICKS_GAP,
	getFontSize,
	getBrickWidth,
};
