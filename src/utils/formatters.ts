type PluralizationOptions = Partial<{
	suffix: 's' | 'es';
	plural: string;
}>;

const assertLength = (length: number) => {
	if (!Number.isInteger(length)) throw new Error('Length must be an integer');
	if (length < 1) throw new Error('Length must be positive');
	return length;
};

const pluralize = (
	count: number,
	string: string,
	{ suffix = 's', plural }: PluralizationOptions = {},
) => (count === 1 ? string : (plural ?? `${string}${suffix}`));

export const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

export const toTitleCase = (string: string) => {
	const initialsRegex = /\b\w/g;
	return string.toLowerCase().replace(initialsRegex, capitalize);
};

export const formatMinLength = (fieldName: string, length = 1) => {
	const sanitizedLength = assertLength(length);

	const message =
		sanitizedLength === 1 ? 'is required' : `must be at least ${sanitizedLength} characters long`;

	return `${capitalize(fieldName)} ${message}`;
};

export const formatMaxLength = (fieldName: string, length: number) => {
	const sanitizedLength = assertLength(length);
	return `${capitalize(fieldName)} cannot be longer than ${sanitizedLength} ${pluralize(sanitizedLength, 'character')}`;
};
