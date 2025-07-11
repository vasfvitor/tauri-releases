import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { marked } from "marked";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function parseMarkdown(content: string) {
	const hed = entitify(content);
	const window = new JSDOM("").window;
	const DOMPurify = createDOMPurify(window);

	return { rawMd: hed, parsedMd: DOMPurify.sanitize(marked(hed)) };
}

export function entitify(str: string): string {
	return str
		.replace(/[&<>"']/g, (entity) => {
			switch (entity) {
				case "&":
					return "&amp;";
				case "<":
					return "&lt;";
				case ">":
					return "&gt;";
				case '"':
					return "&quot;";
				case "'":
					return "&#39;";
				default:
					return entity;
			}
		})
		.replace(/\$\{/g, "$\\{");
}

export function writeOutput(output: string | unknown, fileName: string): void {
	const path = "generated";
	mkdirSync(path, { recursive: true });
	const filePath = join(path, fileName);

	writeFileSync(filePath, JSON.stringify(output, null, 2), "utf-8");
}
