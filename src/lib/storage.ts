import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { type FileOptions, StorageClient } from '@supabase/storage-js';

import { config } from '#config/index.ts';
import { HttpError } from '#utils/errors.ts';

type Bucket = 'avatars';

const createFilePath = (path: string, file: File) => {
	const fileExtension = file.name.split('.').pop();
	return `${path}/${crypto.randomUUID()}.${fileExtension}`;
};

export const storage = new StorageClient(config.storage.url, {
	Authorization: `Bearer ${config.storage.secret}`,
	apikey: config.storage.secret,
});

export const upload = async (bucket: Bucket, path: string, file: File, options?: FileOptions) => {
	const filePath = createFilePath(path, file);
	const { data, error } = await storage.from(bucket).upload(filePath, file, options);

	if (error != null) {
		throw new HttpError(error.status as ContentfulStatusCode, { message: error.message });
	}

	return data;
};

export const maybeUpload = async (
	bucket: Bucket,
	path: string,
	file?: File | null,
	options?: FileOptions,
) => (file == null ? undefined : await upload(bucket, path, file, options));

export const maybeUploadAvatar = async (path: string, file?: File | null, options?: FileOptions) =>
	file == null ? undefined : await upload('avatars', path, file, options);
