import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { type FileOptions, StorageClient } from '@supabase/storage-js';

import { env } from '#env.ts';
import { HttpError } from '#utils/errors.ts';

type Bucket = 'avatars';

export const storage = new StorageClient(`${env.SUPABASE_URL}/storage/v1`, {
	Authorization: `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`,
	apikey: env.SUPABASE_PUBLISHABLE_KEY,
});

export const upload = async (bucket: Bucket, path: string, file: File, options?: FileOptions) => {
	const { data, error } = await storage.from(bucket).upload(path, file, options);

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
