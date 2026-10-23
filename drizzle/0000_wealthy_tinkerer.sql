CREATE TABLE `doses` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`slot` text NOT NULL,
	`taken` integer NOT NULL,
	PRIMARY KEY(`user_id`, `date`, `slot`)
);
--> statement-breakpoint
CREATE TABLE `preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
