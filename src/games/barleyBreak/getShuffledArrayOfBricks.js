export const getShuffledArrayOfBricks = (size) => {
	const total = size * size;
	const bricks = [];

	for (let i = 1; i < total; i++) bricks.push(i);
	bricks.push('');

	const isSolvable = (arr) => {
		const isWin = !arr.filter(Boolean).some((item, index) => index + 1 !== item);

		if (isWin) {
			return false;
		}

		const inversions = arr.reduce((count, curr, i) => {
			if (!curr) return count;
			for (let j = i + 1; j < arr.length; j++) {
				if (arr[j] && arr[j] < curr) count++;
			}
			return count;
		}, 0);

		const emptyRowFromBottom = size - Math.floor(arr.indexOf('') / size);

		if (size % 2 === 1) {
			return inversions % 2 === 0;
		} else {
			if (emptyRowFromBottom % 2 === 0) {
				return inversions % 2 === 1;
			} else {
				return inversions % 2 === 0;
			}
		}
	};

	let shuffled;
	do {
		shuffled = [...bricks];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
	} while (!isSolvable(shuffled));

	return shuffled;
};
