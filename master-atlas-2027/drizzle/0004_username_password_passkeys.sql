CREATE TABLE `atlas_passkeys` (
	`credential_id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`public_key` text NOT NULL,
	`counter` integer DEFAULT 0 NOT NULL,
	`transports` text DEFAULT '[]' NOT NULL,
	`device_type` text NOT NULL,
	`backed_up` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `atlas_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `atlas_passkeys_owner_idx` ON `atlas_passkeys` (`owner`);--> statement-breakpoint
ALTER TABLE `atlas_accounts` ADD `username` text;--> statement-breakpoint
ALTER TABLE `atlas_accounts` ADD `password_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `atlas_accounts_username_unique` ON `atlas_accounts` (`username`);--> statement-breakpoint
ALTER TABLE `atlas_auth_challenges` ADD `username` text;