DO $$ BEGIN
 CREATE TYPE "difficulty" AS ENUM('very-easy', 'easy', 'medium', 'hard', 'very-hard');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"username" varchar(24) PRIMARY KEY NOT NULL,
	"token" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_challenge" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player" (
	"id" integer PRIMARY KEY NOT NULL,
	"value" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room" (
	"id" serial PRIMARY KEY NOT NULL,
	"private" boolean NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"size" integer NOT NULL,
	"current_size" integer NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"creator_username" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_challenge" ADD CONSTRAINT "daily_challenge_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
