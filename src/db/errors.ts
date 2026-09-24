import { toTitleCase } from '#utils/formatters.ts';

type RepositoryInput = Record<string, unknown>;

class RepositoryError extends Error {
	static isRepositoryError(error: unknown) {
		return error instanceof RepositoryError;
	}

	readonly operation;
	readonly entity;
	readonly input;

	constructor(
		operation: 'create' | 'find' | 'update' | 'delete',
		entity: string,
		input: RepositoryInput,
	) {
		super(`Failed to ${operation} entity`);

		this.operation = operation;
		this.entity = toTitleCase(entity);
		this.input = input;
	}
}

export class CreationError extends RepositoryError {
	constructor(entity: string, input: RepositoryInput) {
		super('create', entity, input);
	}
}

export class UpdateError extends RepositoryError {
	constructor(entity: string, input: RepositoryInput) {
		super('update', entity, input);
	}
}

export class DeletionError extends RepositoryError {
	constructor(entity: string, input: RepositoryInput) {
		super('delete', entity, input);
	}
}
