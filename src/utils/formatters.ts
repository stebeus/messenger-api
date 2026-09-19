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

export const formatMinLength = (length: number, fieldName: string) => {
	const assertedLength = assertLength(length);

	const message =
		assertedLength === 1 ? 'is required' : `must be at least ${assertedLength} characters long`;

	return `${capitalize(fieldName)} ${message}`;
};

export const formatMaxLength = (length: number, fieldName: string) => {
	const assertedLength = assertLength(length);
	return `${capitalize(fieldName)} cannot be longer than ${assertedLength} ${pluralize(assertedLength, 'character')}`;
};
