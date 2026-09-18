export const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

export const toTitleCase = (string: string) => {
	const initialsRegex = /\b\w/g;
	return string.toLowerCase().replace(initialsRegex, capitalize);
};
