type PluralizationOptions = Partial<{
	suffix: 's' | 'es';
	plural: string;
}>;

const pluralize = (
	count: number,
	word: string,
	{ suffix = 's', plural }: PluralizationOptions = {},
) => (count === 1 ? word : (plural ?? `${word}${suffix}`));

const validateLength = (length: number) => {
	if (!Number.isInteger(length)) throw new Error('Length must be an integer');
	if (length < 1) throw new Error('Length must be positive');
	return length;
};

export const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

export const toTitleCase = (word: string) => {
	const initialsRegex = /\b\w/g;
	return word.toLowerCase().replace(initialsRegex, capitalize);
};

export const formatMinLength = (length: number, fieldName: string) => {
	const count = validateLength(length);
	const message = count === 1 ? 'is required' : `must be at least ${count} characters long`;
	return `${capitalize(fieldName)} ${message}`;
};

export const formatMaxLength = (length: number, fieldName: string) => {
	const count = validateLength(length);
	return `${capitalize(fieldName)} cannot be longer than ${count} ${pluralize(count, 'character')}`;
};
