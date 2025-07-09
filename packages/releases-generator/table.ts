import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { baseDir, note } from "./config";

export function writeIndexPage(releasesTable: string): void {
	const indexPath = join(baseDir, "index.md");
	mkdirSync(dirname(indexPath), { recursive: true });

	const indexPage = [
		"---",
		note,
		`title: 'Tauri Core Ecosystem Releases'`,
		"---",
	].join("\n");

	const indexPageContent = releasesTable;

	writeFileSync(indexPath, `${indexPage}\n\n${indexPageContent}`);
}
