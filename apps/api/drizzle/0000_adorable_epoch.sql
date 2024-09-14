CREATE TABLE `asset` (
	`key` text PRIMARY KEY NOT NULL,
	`ip_address` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_challenge` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `game_list` (
	`id` text PRIMARY KEY NOT NULL,
	`official` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image_key` text NOT NULL,
	`player_ids` text NOT NULL,
	`ip_address` text NOT NULL,
	`approved_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`image_key`) REFERENCES `asset`(`key`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` text PRIMARY KEY NOT NULL,
	`private` integer NOT NULL,
	`list_id` text NOT NULL,
	`size` integer NOT NULL,
	`levels` integer NOT NULL,
	`duration_between_levels` integer NOT NULL,
	`tip_revealing_interval` integer NOT NULL,
	`current_size` integer NOT NULL,
	`creator_username` text NOT NULL,
	`started_at` integer,
	`finished_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `game_list`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`username` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
