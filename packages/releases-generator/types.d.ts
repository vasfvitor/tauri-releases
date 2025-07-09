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
