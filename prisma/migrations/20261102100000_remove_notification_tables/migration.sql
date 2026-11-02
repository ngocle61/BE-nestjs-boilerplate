-- DropForeignKey
ALTER TABLE "scheduled_messages" DROP CONSTRAINT "scheduled_messages_rule_id_fkey";

-- DropForeignKey
ALTER TABLE "scheduled_messages" DROP CONSTRAINT "scheduled_messages_intervention_id_fkey";

-- DropTable
DROP TABLE "notification_rules";

-- DropTable
DROP TABLE "scheduled_messages";

-- DropEnum
DROP TYPE "NotificationChannel";

-- DropEnum
DROP TYPE "NotificationAudience";

-- DropEnum
DROP TYPE "NotificationTiming";

-- DropEnum
DROP TYPE "TimeUnit";

-- DropEnum
DROP TYPE "ScheduledMessageStatus";

