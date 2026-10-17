-- The current public profiles are test profiles. The owner authorized a clean reset.
DELETE FROM `atlas_states`;
--> statement-breakpoint
DELETE FROM `atlas_history`;
--> statement-breakpoint
DELETE FROM `atlas_sessions`;
--> statement-breakpoint
DELETE FROM `atlas_auth_challenges`;
--> statement-breakpoint
DELETE FROM `atlas_auth_rate_limits`;
--> statement-breakpoint
DELETE FROM `atlas_accounts`;
--> statement-breakpoint
CREATE TABLE `atlas_identities` (
	`provider` text NOT NULL,
	`subject` text NOT NULL,
	`owner` text NOT NULL,
	`email` text,
	`display_name` text,
	`created_at` text NOT NULL,
	`last_login_at` text,
	PRIMARY KEY(`provider`, `subject`),
	FOREIGN KEY (`owner`) REFERENCES `atlas_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `atlas_identities_owner_idx` ON `atlas_identities` (`owner`);--> statement-breakpoint
DROP TABLE `atlas_passkeys`;--> statement-breakpoint
DROP INDEX `atlas_accounts_username_unique`;--> statement-breakpoint
ALTER TABLE `atlas_accounts` DROP COLUMN `username`;--> statement-breakpoint
ALTER TABLE `atlas_auth_challenges` DROP COLUMN `username`;
