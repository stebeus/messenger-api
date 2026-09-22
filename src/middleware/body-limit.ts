import { bodyLimit } from 'hono/body-limit';

import { ContentTooLargeError } from '#utils/errors.ts';

export const limitBody = (maxSize = 512) =>
	bodyLimit({
		maxSize: maxSize * 1024,
		onError: () => {
			throw new ContentTooLargeError({ message: 'File is too large' });
		},
	});
