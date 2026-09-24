import { bodyLimit } from 'hono/body-limit';

import { ContentTooLargeError } from '#utils/errors.ts';

export const limitBody = (maxSizeInKbs = 512) =>
	bodyLimit({
		maxSize: maxSizeInKbs * 1024,
		onError: () => {
			throw new ContentTooLargeError({ resource: 'file' });
		},
	});
