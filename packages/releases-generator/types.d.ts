import type { repositories } from "./config";

export type Branch = { name: string; changelog: string; label: string };
export type Repository = (typeof repositories)[0];
export type RepoPackage = Repository["packages"][0];

export type RepositoryBranch = Repository & { branch: Branch };

export type Package = {
	group: string | null;
	name: string;
	changelog: string;
	tag: string;
	parentUrl: string;
	description: string;
	url: string;
	packages: RepoPackage[];
};

export type PackageWithVersion = Package & {
	version: string;
};

export type Release = {
	version: string;
	notes: string;
};

//

export interface NpmData {
	id: string;
	name: string;
	versions: Record<string, string | undefined>; // Allow undefined values
}

export interface CratesData {
	id: string;
	name: string;
	versions: Record<string, string | undefined>; // Allow undefined values
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
	packages: Record<string, []>;
	repoList: Array<string>;
}

export interface PackageList {
	[key: string]: string[];
}

export interface RepoData {
	packageList: PackageList;
	repoList: string[];
}

export interface FlattenedPackageData {
	name: string;
	group?: string;
	version: string;
	releaseDate?: string;
}
