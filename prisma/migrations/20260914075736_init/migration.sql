CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');

CREATE TYPE "InterventionStatus" AS ENUM ('TO_SCHEDULE', 'AWAITING_CALLBACK', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TYPE "TimeSlot" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'EMAIL');

CREATE TYPE "NotificationAudience" AS ENUM ('CLIENT', 'TECHNICIAN');

CREATE TYPE "NotificationTiming" AS ENUM ('BEFORE_START', 'ON_DEPARTURE', 'AFTER_COMPLETION');

CREATE TYPE "TimeUnit" AS ENUM ('HOURS', 'DAYS');

CREATE TYPE "ScheduledMessageStatus" AS ENUM ('PENDING', 'SENT', 'CANCELLED', 'FAILED');

CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP');

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address_line" TEXT,
    "postal_code" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "interventions" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "technician_id" UUID,
    "created_by_id" UUID,
    "type" TEXT NOT NULL,
    "status" "InterventionStatus" NOT NULL DEFAULT 'TO_SCHEDULE',
    "starts_at" TIMESTAMPTZ(3),
    "duration_minutes" INTEGER NOT NULL,
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "callback_at" TIMESTAMPTZ(3),
    "preferred_slot" "TimeSlot",
    "callback_attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_rules" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "audience" "NotificationAudience" NOT NULL,
    "timing" "NotificationTiming" NOT NULL,
    "offset_value" INTEGER NOT NULL DEFAULT 0,
    "offset_unit" "TimeUnit" NOT NULL DEFAULT 'DAYS',
    "send_at_hour" INTEGER,
    "template" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scheduled_messages" (
    "id" UUID NOT NULL,
    "rule_id" UUID,
    "intervention_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "send_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "ScheduledMessageStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMPTZ(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "scheduled_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "type" "ConversationType" NOT NULL DEFAULT 'DIRECT',
    "title" TEXT,
    "intervention_id" UUID,
    "last_message_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_members" (
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMPTZ(3),

    CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("conversation_id","user_id")
);

CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMPTZ(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

CREATE INDEX "clients_name_idx" ON "clients"("name");

CREATE INDEX "interventions_technician_id_starts_at_idx" ON "interventions"("technician_id", "starts_at");

CREATE INDEX "interventions_status_idx" ON "interventions"("status");

CREATE INDEX "scheduled_messages_status_send_at_idx" ON "scheduled_messages"("status", "send_at");

CREATE INDEX "scheduled_messages_intervention_id_idx" ON "scheduled_messages"("intervention_id");

CREATE INDEX "conversations_last_message_at_idx" ON "conversations"("last_message_at");

CREATE INDEX "conversations_intervention_id_idx" ON "conversations"("intervention_id");

CREATE INDEX "conversation_members_user_id_idx" ON "conversation_members"("user_id");

CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "interventions" ADD CONSTRAINT "interventions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "interventions" ADD CONSTRAINT "interventions_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "interventions" ADD CONSTRAINT "interventions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "notification_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "interventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "interventions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
