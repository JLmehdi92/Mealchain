CREATE TABLE `household` (
	`id` integer PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`week_start` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shopping_checks` (
	`week_start` text NOT NULL,
	`item_id` text NOT NULL,
	`checked` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`week_start`, `item_id`)
);
