export const getMain = () => {
	const root = document.getElementById('main');

	if (!root) {
		return document.body;
	}

	return root;
};
