import type { Hono } from 'hono';

type DateArgs = string | number | Date;

type TimestampsOptions = Partial<{
	createdAt: DateArgs;
	updatedAt: DateArgs;
}>;

type PostJsonOptions = Omit<RequestInit, 'method' | 'body'>;

export const defaultId = '1';

export const defaultId2 = '2';

export const createTimestamp = (timestamp: DateArgs = '2001-01-01T00:00:00') => new Date(timestamp);

export const createTimestamps = ({ createdAt, updatedAt }: TimestampsOptions) =>
	({ createdAt: createTimestamp(createdAt), updatedAt: createTimestamp(updatedAt) }) as const;

export const postJson = async (
	app: Hono,
	url: string | Request | URL,
	body: unknown,
	{ headers, ...rest }: PostJsonOptions = {},
) =>
	await app.request(url, {
		method: 'POST',
		headers: new Headers({ 'content-type': 'application/json', ...headers }),
		body: JSON.stringify(body),
		...rest,
	});
