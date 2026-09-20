import { Hono } from 'hono';

import { dms } from './features/conversations/dms/routes.ts';
import { groups } from './features/conversations/groups/routes.ts';
import { friendRequests } from './features/friend-requests/routes.ts';
import { friends } from './features/friendships/routes.ts';
import { messages } from './features/messages/routes.ts';
import { users } from './features/users/routes.ts';

export const routes = new Hono();

routes.route('/users', users);
routes.route('/friends', friends);
routes.route('/friend-requests', friendRequests);

routes.route('/dms', dms);
routes.route('/groups', groups);
routes.route('/', messages);
