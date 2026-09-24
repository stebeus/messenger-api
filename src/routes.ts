import { Hono } from 'hono';

import { conversations, dms, groups, messages } from './features/conversations/index.ts';
import { friendRequests } from './features/friend-requests/routes.ts';
import { friends } from './features/friendships/routes.ts';
import { users } from './features/users/routes.ts';

export const routes = new Hono();

routes.route('/users', users);
routes.route('/friends', friends);
routes.route('/friend-requests', friendRequests);

routes.route('/conversations', conversations);
routes.route('/dms', dms);
routes.route('/groups', groups);
routes.route('/messages', messages);
