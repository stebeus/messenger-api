import type { UserParams } from '#features/users/contracts/dtos.ts';
import type { DirectMessageParams } from './dtos.ts';

export type DirectMessageMember = DirectMessageParams & UserParams;
