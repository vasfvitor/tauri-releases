import type { repositories } from "./config.js";

export type Repository = (typeof repositories)[0];
export type RepoPackage = Repository["packages"][0];

export type Release = {
	version: string;
	notes: string;
};

export interface NpmData {
	id: string;
	name: string;
	versions: Record<string, string | undefined>;
}

export interface CratesData {
	id: string;
	name: string;
	versions: Record<string, string | undefined>;
}

// CHANGELOG.MD file with all versions
export type RawMarkdown = string;

// repo and group are the same thing - or should be
export interface PackageData {
	[packageName: string]: {
		group?: string;
		changelogs: RawMarkdown;
		npmData: NpmData;
		cratesData: CratesData;
	};
}

export interface TableData {
	name: string;
	repo: string;
	version: string;
	changelog: RawMarkdown;
	date: string | "-";
}

export interface TableMetadata {
	packages: Record<string, string[]>;
	repoList: Array<string>;
}
