CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "residents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(30),
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"sequence_no" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "groups_sequence_no_unique" UNIQUE("sequence_no"),
	CONSTRAINT "groups_sequence_no_check" CHECK ("groups"."sequence_no" > 0)
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"resident_id" uuid NOT NULL,
	"joined_at" date DEFAULT now() NOT NULL,
	"left_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_members_left_at_check" CHECK ("group_members"."left_at" IS NULL OR "group_members"."left_at" >= "group_members"."joined_at")
);
--> statement-breakpoint
CREATE TABLE "work_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_date" date NOT NULL,
	"title" varchar(150),
	"notes" text,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"created_by" uuid,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_schedules_work_date_unique" UNIQUE("work_date"),
	CONSTRAINT "work_schedules_status_check" CHECK ("work_schedules"."status" IN ('scheduled', 'completed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "schedule_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"order_no" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schedule_groups_schedule_group_unique" UNIQUE("schedule_id","group_id"),
	CONSTRAINT "schedule_groups_schedule_order_unique" UNIQUE("schedule_id","order_no"),
	CONSTRAINT "schedule_groups_order_no_check" CHECK ("schedule_groups"."order_no" > 0)
);
--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"resident_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_amount" numeric(12, 2),
	"payment_date" date,
	"notes" text,
	"marked_by" uuid,
	"marked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendances_schedule_resident_unique" UNIQUE("schedule_id","resident_id"),
	CONSTRAINT "attendances_status_check" CHECK ("attendances"."status" IN ('pending', 'present', 'paid', 'absent')),
	CONSTRAINT "attendances_payment_check" CHECK (
      (
        "attendances"."status" = 'paid'
        AND "attendances"."payment_amount" IS NOT NULL
        AND "attendances"."payment_amount" > 0
        AND "attendances"."payment_date" IS NOT NULL
      )
      OR
      (
        "attendances"."status" <> 'paid'
        AND "attendances"."payment_amount" IS NULL
        AND "attendances"."payment_date" IS NULL
      )
    )
);
--> statement-breakpoint
CREATE TABLE "rotation_state" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"next_group_id" uuid,
	"is_paused" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rotation_state_id_check" CHECK ("rotation_state"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"default_replacement_amount" numeric(12, 2) DEFAULT '100000' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_id_check" CHECK ("app_settings"."id" = 1),
	CONSTRAINT "app_settings_amount_check" CHECK ("app_settings"."default_replacement_amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_groups" ADD CONSTRAINT "schedule_groups_schedule_id_work_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."work_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_groups" ADD CONSTRAINT "schedule_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_schedule_id_work_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."work_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_marked_by_users_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_state" ADD CONSTRAINT "rotation_state_next_group_id_groups_id_fk" FOREIGN KEY ("next_group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "residents_name_idx" ON "residents" USING btree ("name");--> statement-breakpoint
CREATE INDEX "residents_is_active_idx" ON "residents" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "group_members_active_membership_idx" ON "group_members" USING btree ("resident_id") WHERE "group_members"."left_at" IS NULL;--> statement-breakpoint
CREATE INDEX "group_members_active_group_idx" ON "group_members" USING btree ("group_id") WHERE "group_members"."left_at" IS NULL;--> statement-breakpoint
CREATE INDEX "attendances_schedule_idx" ON "attendances" USING btree ("schedule_id");--> statement-breakpoint
CREATE INDEX "attendances_resident_idx" ON "attendances" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "attendances_group_idx" ON "attendances" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "attendances_status_idx" ON "attendances" USING btree ("status");