CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "conversation";
--> statement-breakpoint
CREATE SCHEMA "social";
--> statement-breakpoint
CREATE TABLE "auth"."accounts" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auth"."accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" bigint NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text
);
--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auth"."sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"ip_address" text,
	"user_agent" text,
	"user_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auth"."users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"username" text NOT NULL UNIQUE,
	"display_name" text,
	"bio" text,
	"avatar" text,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."verifications" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auth"."verifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation"."bans" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" bigint NOT NULL,
	"group_id" bigint NOT NULL,
	"reason" text NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "bans_user_id_group_id_unique" UNIQUE("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "conversation"."conversations" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversation"."conversations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" text DEFAULT 'direct' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation"."groups" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"conversation_id" bigint NOT NULL,
	"owner_id" bigint NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar" text,
	"visibility" text DEFAULT 'private' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation"."members" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" bigint NOT NULL,
	"conversation_id" bigint NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	CONSTRAINT "members_user_id_conversation_id_unique" UNIQUE("user_id","conversation_id")
);
--> statement-breakpoint
CREATE TABLE "conversation"."messages" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversation"."messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"sender_id" bigint NOT NULL,
	"conversation_id" bigint NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social"."friend_requests" (
	"requester_id" bigint NOT NULL,
	"recipient_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "no_self_friend_request" CHECK ("requester_id" <> "recipient_id")
);
--> statement-breakpoint
CREATE TABLE "social"."friendships" (
	"user1_id" bigint NOT NULL,
	"user2_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_user1_id_user2_id_unique" UNIQUE("user1_id","user2_id"),
	CONSTRAINT "no_self_friendship" CHECK ("user1_id" <> "user2_id"),
	CONSTRAINT "friendship_id_order" CHECK ("user1_id"::bigint < "user2_id"::bigint)
);
--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "auth"."accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "auth"."sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "auth"."verifications" ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "friend_request_idx" ON "social"."friend_requests" (greatest("requester_id"::bigint, "recipient_id"::bigint),least("requester_id"::bigint, "recipient_id"::bigint));--> statement-breakpoint
ALTER TABLE "auth"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation"."bans" ADD CONSTRAINT "bans_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation"."bans" ADD CONSTRAINT "bans_group_id_conversations_id_fkey" FOREIGN KEY ("group_id") REFERENCES "conversation"."conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation"."groups" ADD CONSTRAINT "groups_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"."conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation"."groups" ADD CONSTRAINT "groups_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation"."members" ADD CONSTRAINT "members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation"."members" ADD CONSTRAINT "members_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"."conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation"."messages" ADD CONSTRAINT "messages_sender_id_users_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation"."messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"."conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "social"."friend_requests" ADD CONSTRAINT "friend_requests_requester_id_users_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "social"."friend_requests" ADD CONSTRAINT "friend_requests_recipient_id_users_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "social"."friendships" ADD CONSTRAINT "friendships_user1_id_users_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "social"."friendships" ADD CONSTRAINT "friendships_user2_id_users_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;