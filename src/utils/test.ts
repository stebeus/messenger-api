import type { Hono } from 'hono';

type DateArgs = string | number | Date;

type TimestampsOptions = Partial<{
	createdAt: DateArgs;
	updatedAt: DateArgs;
}>;

type RequestOptions = Omit<RequestInit, 'body'>;

type RequestUrl = string | Request | URL;

const requestApi = async (
	app: Hono,
	url: RequestUrl,
	{ method = 'post', ...options }: RequestInit = {},
) => await app.request(url, { ...options, method: method.toUpperCase() });

export const defaultId = '1';

export const defaultId2 = '2';

export const createTimestamp = (timestamp: DateArgs = '2001-01-01T00:00:00') => new Date(timestamp);

export const createTimestamps = ({ createdAt, updatedAt }: TimestampsOptions) =>
	({ createdAt: createTimestamp(createdAt), updatedAt: createTimestamp(updatedAt) }) as const;

export const requestJson = async (
	app: Hono,
	url: RequestUrl,
	body: unknown,
	{ headers, ...options }: RequestOptions = {},
) => {
	const requestHeaders = new Headers(headers);
	requestHeaders.set('content-type', 'application/json');

	return await requestApi(app, url, {
		...options,
		headers: requestHeaders,
		body: JSON.stringify(body),
	});
};

export const requestMultipartForm = async (
	app: Hono,
	url: RequestUrl,
	body: Record<string, string | File>,
	options?: RequestOptions,
) => {
	const form = new FormData();
	for (const [key, value] of Object.entries(body)) form.append(key, value);
	return await requestApi(app, url, { ...options, body: form });
};
