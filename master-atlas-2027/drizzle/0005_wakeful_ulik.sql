CREATE TABLE `atlas_mcp_authorization_codes` (
	`code_hash` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`client_id` text NOT NULL,
	`redirect_uri` text NOT NULL,
	`response_state` text NOT NULL,
	`code_challenge` text NOT NULL,
	`scopes` text NOT NULL,
	`resource` text NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	FOREIGN KEY (`owner`) REFERENCES `atlas_accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `atlas_mcp_clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `atlas_mcp_auth_codes_owner_idx` ON `atlas_mcp_authorization_codes` (`owner`);--> statement-breakpoint
CREATE TABLE `atlas_mcp_authorization_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`client_id` text NOT NULL,
	`redirect_uri` text NOT NULL,
	`response_state` text NOT NULL,
	`code_challenge` text NOT NULL,
	`scopes` text NOT NULL,
	`resource` text NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	FOREIGN KEY (`owner`) REFERENCES `atlas_accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `atlas_mcp_clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `atlas_mcp_auth_requests_owner_idx` ON `atlas_mcp_authorization_requests` (`owner`);--> statement-breakpoint
CREATE TABLE `atlas_mcp_clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`redirect_uris` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `atlas_mcp_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`client_id` text NOT NULL,
	`token_type` text NOT NULL,
	`scopes` text NOT NULL,
	`resource` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `atlas_accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `atlas_mcp_clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `atlas_mcp_tokens_owner_idx` ON `atlas_mcp_tokens` (`owner`);--> statement-breakpoint
CREATE INDEX `atlas_mcp_tokens_client_idx` ON `atlas_mcp_tokens` (`client_id`);