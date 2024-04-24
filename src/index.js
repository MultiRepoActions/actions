import { Octokit } from "@octokit/rest";
import {
  getReposForOrg,
  getReposWithPackageJson,
  getPackagesJsonFromRepoContent,
} from "./getRepos.js";

let octokit;
// if (!process.env.CI) {
octokit = new Octokit({
  auth: process.env.GITHUB_API_TOKEN,
});
// }

export default async function getReposWithPackages(
  orgName,
  packageName,
  version,
) {
  const masterOrgName = orgName || "MultiRepoActions";

  const repos = await getReposForOrg(octokit, masterOrgName);

  const validRepos = await getReposWithPackageJson(
    octokit,
    masterOrgName,
    repos,
  );

  // update repos where the package.json has either dependencies or devDependencies that match the name of the provided package.

  const repoList = await validRepos.map(async (repo) => {
    const packageJson = await getPackagesJsonFromRepoContent(
      octokit,
      masterOrgName,
      repo.name,
    );
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    return {
      repo: repo.full_name,
      dependencies,
      devDependencies,
    };
  });

  const reposWithDependencyList = await Promise.all(repoList);

  // look for the package name in the dependencies or devDependencies of each repo, return the repo name if found
  const reposToUpdate = reposWithDependencyList.filter((repo) => {
    const { dependencies, devDependencies } = repo;
    const packageVersion =
      dependencies[packageName] || devDependencies[packageName];
    return packageVersion && packageVersion !== version;
  });

  // console.log(reposToUpdate);

  // console.log(reposToUpdate);

  const reposMatrix = reposToUpdate.map((repo) => {
    return { repo: repo.repo };
  });

  console.log(reposMatrix);

  const obj = {
    include: reposMatrix,
  };

  return JSON.stringify(obj);
}

// used when running locally
if (!process.env.CI) {
  getReposWithPackages(
    "MultiRepoActions",
    "@multi-repo-actions/demo-package-a",
    "1.0.1",
  );
}

// doThing();

// console.log(reposToUpdate);

// console.log(validRepos);
