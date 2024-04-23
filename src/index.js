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

export default async function doThing(orgName) {
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
      repo,
    );
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    return {
      repo,
      dependencies,
      devDependencies,
    };
  });

  const reposWithDependencyList = await Promise.all(repoList);

  // console.log(reposToUpdate);

  console.log(reposWithDependencyList);
}

doThing();

// console.log(reposToUpdate);

// console.log(validRepos);
