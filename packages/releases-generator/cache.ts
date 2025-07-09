import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { __dirname } from "./config";
import { createHash } from "node:crypto";

const CACHE_DIR = join(__dirname, ".cache");
const TWO_HOURS = 1000 * 60 * 60 * 2;
const CACHE_DURATION = TWO_HOURS;

interface CacheEntry {
	url: string;
	content: string;
	timestamp: number;
	etag?: string | undefined;
}

function getCacheFilePath(url: string): string {
	if (!existsSync(CACHE_DIR)) {
		mkdirSync(CACHE_DIR, { recursive: true });
	}
	const key = createHash("md5").update(url).digest("hex");
	return join(CACHE_DIR, `${key}.json`);
}

function isCacheValid(entry: CacheEntry): boolean {
	const now = Date.now();
	return now - entry.timestamp < CACHE_DURATION;
}

function readCache(url: string): CacheEntry | null {
	const cachePath = getCacheFilePath(url);

	if (!existsSync(cachePath)) {
		return null;
	}

	try {
		const content = readFileSync(cachePath, "utf-8");
		const entry: CacheEntry = JSON.parse(content);

		if (isCacheValid(entry)) {
			return entry;
		}
		return null;
	} catch (error) {
		console.warn(`readCache failed ${url}:`, error);
		return null;
	}
}

function writeCache(
	url: string,
	content: string,
	etag?: string | undefined,
): void {
	const cachePath = getCacheFilePath(url);
	const entry: CacheEntry = {
		url,
		content,
		timestamp: Date.now(),
		...(etag ? { etag } : {}),
	};

	try {
		writeFileSync(cachePath, JSON.stringify(entry, null, 2));
	} catch (error) {
		console.warn(`failed to write: ${url} to ${cachePath}`, error);
	}
}

export async function fetchWithCache(
	url: string,
	delay = 1000,
): Promise<string> {
	const cachedEntry = readCache(url);
	if (cachedEntry) {
		return cachedEntry.content;
	}

	console.log(`Fetching ${url}...`);

	// avoid rate limiting
	if (delay > 0) {
		await new Promise((resolve) => setTimeout(resolve, delay));
	}

	try {
		const headers: HeadersInit = {};
		// todo: fix and test etag support
		//
		const expiredEntry = readCache(url);
		// if (expiredEntry?.etag) {
		// 	headers["If-None-Match"] = expiredEntry.etag;
		// }

		const response = await fetch(url, { headers });

		if (response.status === 304) {
			if (expiredEntry) {
				writeCache(url, expiredEntry.content, expiredEntry.etag);
				return expiredEntry.content;
			}
		}

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const content = await response.text();
		const etag = response.headers.get("etag") || undefined;

		writeCache(url, content, etag);

		return content;
	} catch (error) {
		console.error(url);
		const fallbackEntry = readCache(url);
		if (fallbackEntry) {
			return fallbackEntry.content;
		}
		throw error;
	}
}
