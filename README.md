# Messenger API

This API provides user authentication, friendships, direct and group conversations, and real-time communication through REST operations and WebSocket events.

Users begin by signing up, so that they can find and befriend other users or discover and join groups where they aren't banned. After joining a group, they can exchange and manage their messages, and moderate the group when permitted by its owner.

Some of these operations coordinate multiple parts of the application. For example, banning a member removes their membership and messages while creating a ban to prevent them from rejoining the group. These are operated by REST endpoints, whose data gets emitted in events for the WebSocket chat rooms.

## Features

- **Authentication**: Register, sign in, and manage your account.

- **Social relationships:** Find, befriend, and message users directly.

- **Groups:** Manage, discover, and moderate them.

- **Messaging:** Send, edit, and delete messages.

- **Real-time communication:** Connect to a chat room to receive its events.

## WebSockets

WebSocket chat rooms receive events resulting from REST operations, and can disconnect the user when they are expelled from a group or when the conversation is deleted.

These events use the `resource.operation` format and are grouped by resource:

- `conversation.deleted`
- `group.updated`
- `member.`
  - `joined`
  - `left`
  - `updated`
  - `kicked`
  - `banned`
  - `unbanned`
- `message.`
  - `sent`
  - `edited`
  - `deleted`

## REST operations

They handle all API actions and can emit corresponding events to the connected chat rooms. Their [OpenAPI reference]() shows how they validate, authenticate, and handle requests.

## Design decisions

Validation schemas and their derived types form contracts for the application resources, as they're clear, maintainable, and reusable.

Alongside contracts, modules are organized by feature to separate them from infrastructure, such as third-party libraries. Each feature uses repositories for database operations, services for application logic, and routes for handling HTTP and WebSocket requests.

Only groups lack services. They instead retrieve data with queries and mutates the database with commands, because group authorization spans multiple features.

## License

[MIT](LICENSE.txt)
