import fetch from "make-fetch-happen";
import { appendFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Repository } from "./types";

const fetchWithCache = async (
	url: string,
	cacheDir: string,
): Promise<string> => {
	const response = await fetch(url, {
		cachePath: `./.cache/${cacheDir}`,
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}
	return response.text();
};

// todo: define types that we need
interface NpmData {
	id: string;
	name: string;
	versions: Record<string, unknown>;
}

interface CratesData {
	id: string;
	name: string;
	updatedAt: string;
	versions: Record<string, string>;
}

type RawMarkdown = string;

interface PackageData {
	changelogs: Record<string, RawMarkdown>;
	npmData: Record<string, NpmData>;
	cratesData: Record<string, CratesData>;
}

function logError(message: string, error: unknown) {
	const logMessage = `${new Date().toISOString()} - ${message}: ${
		error instanceof Error ? error.stack : error
	}\n`;
	appendFileSync("error.log", logMessage);
}

function logOk(message: string, url: string) {
	const logMessage = `${new Date().toISOString()} - ${message} (URL: ${url})\n`;
	appendFileSync("success.log", logMessage);
}

interface CrateVersion {
	num: string;
	created_at: string;
}

function formatCrateVersion(versions: CrateVersion[]): Record<string, string> {
	return Object.fromEntries(
		versions.map((version) => [version.num, version.created_at]),
	);
}

export async function fetchData(
	repositories: Repository[],
): Promise<PackageData> {
	const changelogs: { [key: string]: string } = {};
	const npmData: Record<string, NpmData> = {};
	const cratesData: Record<string, CratesData> = {};

	for (const repo of repositories) {
		for (const pkg of repo.packages) {
			try {
				console.log(`fetching ${pkg.name}...`);

				const { githubPath, npmPath, cratesPath } = pkg;

				if (githubPath) {
					const rawUrl = repo.repoUrl.replace(
						"github.com",
						"raw.githubusercontent.com",
					);
					const githubUrl = githubPath
						? `${rawUrl}/${repo.branch || "dev"}/${githubPath}/CHANGELOG.md`
						: `${rawUrl}/CHANGELOG.md`;

					try {
						changelogs[pkg.name] = await fetchWithCache(
							githubUrl,
							`changelogs/${pkg.name}`,
						);
						logOk(`fetched changelog for ${pkg.name}`, githubUrl);
					} catch (error) {
						logError(`failed ${pkg.name} - ${githubUrl}`, error);
					}
				}

				if (npmPath) {
					const npmUrl = `https://registry.npmjs.org/${npmPath}`;
					try {
						const npmResponse = await fetchWithCache(npmUrl, `npm/${pkg.name}`);
						const rawData = JSON.parse(npmResponse);
						npmData[pkg.name] = {
							id: rawData._id,
							name: rawData.name,
							// object keyed by version - time
							versions: rawData.time,
							time: rawData.time,
						};
						logOk(`fetched npm data for ${pkg.name}`, npmUrl);
					} catch (error) {
						logError(`failed ${pkg.name} - ${npmUrl}`, error);
					}
				}

				if (cratesPath) {
					const cratesUrl = `https://crates.io/api/v1/crates/${cratesPath}`;
					try {
						const cratesResponse = await fetchWithCache(
							cratesUrl,
							`crates/${pkg.name}`,
						);
						const rawData = JSON.parse(cratesResponse);
						cratesData[pkg.name] = {
							id: rawData.crate.id,
							name: rawData.crate.name,
							updatedAt: rawData.crate.updated_at,
							versions: formatCrateVersion(rawData.versions || []),
						};
						logOk(`fetched crates data for ${pkg.name}`, cratesUrl);
					} catch (error) {
						logError(`failed ${pkg.name} - ${cratesUrl}`, error);
					}
				}
			} catch (error) {
				logError(`Failed to fetch data for ${pkg.name}`, error);
			}
		}
	}

	return {
		changelogs,
		npmData,
		cratesData,
	};
}

// Function to write the output to a JSON file in the VitePress /api directory
export function writeOutputToJson(output: PackageData): void {
	const path = "generated";
	mkdirSync(path, { recursive: true });

	const filePath = join(path, "data.json");
	writeFileSync(filePath, JSON.stringify(output, null, 2), "utf-8");

	console.log(`done: ${filePath}`);
}
