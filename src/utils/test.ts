import type { Hono } from 'hono';

type DateArgs = string | number | Date;

type TimestampsOptions = Partial<{
	createdAt: DateArgs;
	updatedAt: DateArgs;
}>;

type JsonRequestOptions = Omit<RequestInit, 'body'>;

export const defaultId = '1';

export const defaultId2 = '2';

export const createTimestamp = (timestamp: DateArgs = '2001-01-01T00:00:00') => new Date(timestamp);

export const createTimestamps = ({ createdAt, updatedAt }: TimestampsOptions) =>
	({ createdAt: createTimestamp(createdAt), updatedAt: createTimestamp(updatedAt) }) as const;

export const requestJson = async (
	app: Hono,
	url: string | Request | URL,
	body: unknown,
	{ method = 'post', headers, ...options }: JsonRequestOptions = {},
) => {
	const requestHeaders = new Headers(headers);
	requestHeaders.set('content-type', 'application/json');

	return await app.request(url, {
		...options,
		method: method.toUpperCase(),
		headers: requestHeaders,
		body: JSON.stringify(body),
	});
};
