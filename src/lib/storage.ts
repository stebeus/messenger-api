import { StorageClient } from '@supabase/storage-js';

import { env } from '#env.ts';

export const storage = new StorageClient(`${env.SUPABASE_URL}/storage/v1`, {
	Authorization: `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`,
	apikey: env.SUPABASE_PUBLISHABLE_KEY,
});
