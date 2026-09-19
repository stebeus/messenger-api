const alphanumericRegex = /^[\p{L}\p{N}_]+$/u;

export const username = {
	fieldName: 'username',
	minLength: 3,
	maxLength: 30,
	regex: alphanumericRegex,
} as const;

export const displayName = {
	fieldName: 'display name',
	maxLength: 50,
} as const;

export const bio = {
	fieldName: 'bio',
	maxLength: 250,
} as const;

export const password = {
	fieldName: 'password',
	minLength: 8,
	maxLength: 128,
} as const;
