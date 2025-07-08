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
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri",
			},
			{
				name: "@tauri-apps/api",
				path: "packages/api",
				description: "JS/TS API for interaction with the Rust backend.",
				source: "npm",
				packageUrl: "https://www.npmjs.com/package/@tauri-apps/api",
			},
			{
				name: "tauri-cli",
				path: "crates/tauri-cli",
				description: "CLI to create, develop, and build Tauri apps.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-cli",
			},
			{
				name: "@tauri-apps/cli",
				path: "packages/cli",
				description: "Node.js wrapper for the `tauri-cli` Rust binary.",
				source: "npm",
				packageUrl: "https://www.npmjs.com/package/@tauri-apps/cli",
			},
			{
				name: "tauri-bundler",
				path: "crates/tauri-bundler",
				description: "Create platform-specific bundles and installers.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-bundler",
			},
			{
				name: "tauri-build",
				path: "crates/tauri-build",
				description: "A helper library for tauri app's build script.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-build",
			},
			{
				name: "tauri-codegen",
				path: "crates/tauri-codegen",
				description: "Compile-time code generation for Tauri.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-codegen",
			},
			{
				name: "tauri-driver",
				path: "crates/tauri-driver",
				description: "WebDriver client for testing Tauri applications.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-driver",
			},
			{
				name: "tauri-macros",
				path: "crates/tauri-macros",
				description: "Internal macros for the Tauri framework.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-macros",
			},
			{
				name: "tauri-plugin",
				path: "crates/tauri-plugin",
				description: "The Tauri plugin system.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-plugin",
			},
			{
				name: "tauri-runtime",
				path: "crates/tauri-runtime",
				description: "Tauri's runtime abstraction layer.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-runtime",
			},
			{
				name: "tauri-runtime-wry",
				path: "crates/tauri-runtime-wry",
				description: "The Wry-based runtime for Tauri.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-runtime-wry",
			},
			{
				name: "tauri-utils",
				path: "crates/tauri-utils",
				description: "Common utilities for the Tauri framework.",
				source: "crates",
				packageUrl: "https://crates.io/crates/tauri-utils",
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
				source: "crates",
				packageUrl: "https://crates.io/crates/wry",
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
				source: "crates",
				packageUrl: "https://crates.io/crates/tao",
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
				description: "Rapidly scaffold a new Tauri app.",
				source: "npm",
				packageUrl: "https://www.npmjs.com/package/create-tauri-app",
			},
		],
	},
];

// todo add plugin-workspace
