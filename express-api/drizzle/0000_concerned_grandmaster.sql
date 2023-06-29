CREATE TABLE IF NOT EXISTS "session" (
	"username" varchar(24) PRIMARY KEY NOT NULL,
	"token" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
