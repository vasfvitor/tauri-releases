import type { repositories } from "./config";

export type Branch = { name: string; changelog: string; label: string };
export type Repository = (typeof repositories)[0];

export type RepositoryBranch = Repository & { branch: Branch };
