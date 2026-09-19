const sanitizeLength = (length: number) => {
	if (!Number.isInteger(length)) throw new Error('Length must be an integer');
	if (length < 1) throw new Error('Length must be positive');
	return length;
};

export const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

export const toTitleCase = (string: string) => {
	const initialsRegex = /\b\w/g;
	return string.toLowerCase().replace(initialsRegex, capitalize);
};

export const formatMinLength = (fieldName: string, length = 1) => {
	const sanitizedLength = sanitizeLength(length);

	const message =
		sanitizedLength === 1 ? 'is required' : `must be at least ${sanitizedLength} characters long`;

	return `${capitalize(fieldName)} ${message}`;
};
