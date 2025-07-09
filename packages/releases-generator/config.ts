import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const note =
	"\n# NOTE: This file is auto-generated in packages/releases-generator/build.ts";

export const baseDir = "../../src/content";
export const __dirname = dirname(fileURLToPath(import.meta.url));

// todo: remove non userfacing packages
// todo: deal with branches

export const repositories = [
	{
		name: "tauri",
		displayName: "Tauri",
		repoUrl: "https://github.com/tauri-apps/tauri",
		packages: [
			{
				name: "tauri",
				path: "crates/tauri",
				description: "The core Tauri runtime.",
				cargo: "https://crates.io/crates/tauri",
			},
			{
				name: "tauri-cli",
				path: "crates/tauri-cli",
				description: "CLI to create, develop, and build Tauri apps.",
				cargo: "https://crates.io/crates/tauri-cli",
			},
			{
				name: "@tauri-apps/api",
				path: "packages/api",
				description: "JS/TS API for interaction with the Rust backend.",
				npm: "https://www.npmjs.com/package/@tauri-apps/api",
			},
			{
				name: "@tauri-apps/cli",
				path: "packages/cli",
				description: "Node.js wrapper for the `tauri-cli` Rust binary.",
				npm: "https://www.npmjs.com/package/@tauri-apps/cli",
			},
			{
				name: "tauri-bundler",
				path: "crates/tauri-bundler",
				description: "Create platform-specific bundles and installers.",
				cargo: "https://crates.io/crates/tauri-bundler",
			},
			{
				name: "tauri-build",
				path: "crates/tauri-build",
				description: "A helper library for tauri app's build script.",
				cargo: "https://crates.io/crates/tauri-build",
			},
			{
				name: "tauri-codegen",
				path: "crates/tauri-codegen",
				description: "Compile-time code generation for Tauri.",
				cargo: "https://crates.io/crates/tauri-codegen",
			},
			{
				name: "tauri-driver",
				path: "crates/tauri-driver",
				description: "WebDriver client for testing Tauri applications.",
				cargo: "https://crates.io/crates/tauri-driver",
			},
			{
				name: "tauri-macros",
				path: "crates/tauri-macros",
				description: "Internal macros for the Tauri framework.",
				cargo: "https://crates.io/crates/tauri-macros",
			},
			{
				name: "tauri-plugin",
				path: "crates/tauri-plugin",
				description: "The Tauri plugin system.",
				cargo: "https://crates.io/crates/tauri-plugin",
			},
			{
				name: "tauri-runtime",
				path: "crates/tauri-runtime",
				description: "Tauri's runtime abstraction layer.",
				cargo: "https://crates.io/crates/tauri-runtime",
			},
			{
				name: "tauri-runtime-wry",
				path: "crates/tauri-runtime-wry",
				description: "The Wry-based runtime for Tauri.",
				cargo: "https://crates.io/crates/tauri-runtime-wry",
			},
			{
				name: "tauri-utils",
				path: "crates/tauri-utils",
				description: "Common utilities for the Tauri framework.",
				cargo: "https://crates.io/crates/tauri-utils",
			},
		],
	},
	{
		name: "wry",
		displayName: "Wry",
		repoUrl: "https://github.com/tauri-apps/wry",
		packages: [
			{
				name: "wry",
				path: "", // root
				description: "Cross-platform WebView rendering library in Rust.",
				cargo: "https://crates.io/crates/wry",
			},
		],
	},
	{
		name: "tao",
		displayName: "Tao",
		repoUrl: "https://github.com/tauri-apps/tao",
		packages: [
			{
				name: "tao",
				path: "", // root
				description:
					"Cross-platform application window creation library in Rust.",
				cargo: "https://crates.io/crates/tao",
			},
		],
	},
	{
		name: "create-tauri-app",
		displayName: "CTA",
		repoUrl: "https://github.com/tauri-apps/create-tauri-app",
		packages: [
			{
				name: "create-tauri-app",
				path: "", // root
				description: "Rapidly scaffold out a new Tauri project.",
				npm: "https://www.npmjs.com/package/create-tauri-app",
			},
		],
	},
	{
		name: "plugins-workspace",
		displayName: "Plugins",
		repoUrl: "https://github.com/tauri-apps/plugins-workspace",
		branch: "v2",
		packages: [
			{
				name: "autostart",
				path: "plugins/autostart",
				description: "Register your app to run on startup.",
				cargo: "https://crates.io/crates/tauri-plugin-autostart",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-autostart",
			},
			{
				name: "barcode-scanner",
				path: "plugins/barcode-scanner",
				description: "Scan barcodes and QR codes.",
				cargo: "https://crates.io/crates/tauri-plugin-barcode-scanner",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-barcode-scanner",
			},
			{
				name: "biometric",
				path: "plugins/biometric",
				description: "Authenticate users with biometrics.",
				cargo: "https://crates.io/crates/tauri-plugin-biometric",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-biometric",
			},
			{
				name: "clipboard-manager",
				path: "plugins/clipboard-manager",
				description: "Manage the system clipboard.",
				cargo: "https://crates.io/crates/tauri-plugin-clipboard-manager",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-clipboard-manager",
			},
			{
				name: "deep-link",
				path: "plugins/deep-link",
				description: "Open your app through a custom URL scheme.",
				cargo: "https://crates.io/crates/tauri-plugin-deep-link",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-deep-link",
			},
			{
				name: "dialog",
				path: "plugins/dialog",
				description: "Native dialogs for your app.",
				cargo: "https://crates.io/crates/tauri-plugin-dialog",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-dialog",
			},
			{
				name: "fs",
				path: "plugins/fs",
				description: "Modern and easy-to-use file system API.",
				cargo: "https://crates.io/crates/tauri-plugin-fs",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-fs",
			},
			{
				name: "global-shortcut",
				path: "plugins/global-shortcut",
				description: "Register global shortcuts for your app.",
				cargo: "https://crates.io/crates/tauri-plugin-global-shortcut",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-global-shortcut",
			},
			{
				name: "http",
				path: "plugins/http",
				description: "Make HTTP requests from your app.",
				cargo: "https://crates.io/crates/tauri-plugin-http",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-http",
			},
			{
				name: "log",
				path: "plugins/log",
				description: "Configurable logging for your app.",
				cargo: "https://crates.io/crates/tauri-plugin-log",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-log",
			},
			{
				name: "nfc",
				path: "plugins/nfc",
				description: "Read and write NFC tags.",
				cargo: "https://crates.io/crates/tauri-plugin-nfc",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-nfc",
			},
			{
				name: "notification",
				path: "plugins/notification",
				description: "Send native notifications from your app.",
				cargo: "https://crates.io/crates/tauri-plugin-notification",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-notification",
			},
			{
				name: "os",
				path: "plugins/os",
				description: "Access operating system-specific information.",
				cargo: "https://crates.io/crates/tauri-plugin-os",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-os",
			},
			{
				name: "positioner",
				path: "plugins/positioner",
				description: "Move and resize your app's windows.",
				cargo: "https://crates.io/crates/tauri-plugin-positioner",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-positioner",
			},
			{
				name: "process",
				path: "plugins/process",
				description: "Manage child processes.",
				cargo: "https://crates.io/crates/tauri-plugin-process",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-process",
			},
			{
				name: "shell",
				path: "plugins/shell",
				description: "Open external programs and URLs.",
				cargo: "https://crates.io/crates/tauri-plugin-shell",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-shell",
			},
			{
				name: "sql",
				path: "plugins/sql",
				description: "Connect to and manage SQL databases.",
				cargo: "https://crates.io/crates/tauri-plugin-sql",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-sql",
			},
			{
				name: "store",
				path: "plugins/store",
				description: "Persistent key-value storage for your app.",
				cargo: "https://crates.io/crates/tauri-plugin-store",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-store",
			},
			{
				name: "stronghold",
				path: "plugins/stronghold",
				description: "Securely store sensitive data.",
				cargo: "https://crates.io/crates/tauri-plugin-stronghold",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-stronghold",
			},
			{
				name: "updater",
				path: "plugins/updater",
				description: "Update your app from a remote server.",
				cargo: "https://crates.io/crates/tauri-plugin-updater",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-updater",
			},
			{
				name: "upload",
				path: "plugins/upload",
				description: "Upload files to a remote server.",
				cargo: "https://crates.io/crates/tauri-plugin-upload",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-upload",
			},
			{
				name: "websocket",
				path: "plugins/websocket",
				description: "Connect to and manage WebSocket connections.",
				cargo: "https://crates.io/crates/tauri-plugin-websocket",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-websocket",
			},
			{
				name: "window-state",
				path: "plugins/window-state",
				description: "Save and restore window state.",
				cargo: "https://crates.io/crates/tauri-plugin-window-state",
				npm: "https://www.npmjs.com/package/@tauri-apps/plugin-window-state",
			},
		],
	},
];
