import { bodyLimit } from 'hono/body-limit';

import { ContentTooLargeError, type HttpErrorMessageFormatOptions } from '#utils/errors.ts';

type FileSizeLimitOptions = HttpErrorMessageFormatOptions & {
	maxSizeInKiB?: number;
};

export const limitFileSize = ({
	maxSizeInKiB = 1024,
	resource = 'file',
	message,
}: FileSizeLimitOptions = {}) =>
	bodyLimit({
		maxSize: maxSizeInKiB * 1024,
		onError: () => {
			throw new ContentTooLargeError({ resource, message });
		},
	});

export const limitImageSize = ({
	maxSizeInKiB = 512,
	resource = 'image',
	message,
}: FileSizeLimitOptions = {}) => limitFileSize({ maxSizeInKiB, resource, message });
