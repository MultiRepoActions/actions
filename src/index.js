import { Octokit } from "@octokit/rest";
import {
  getReposForOrg,
  getReposWithPackageJson,
  getPackagesJsonFromRepoContent,
} from "./getRepos.js";

let octokit;
if (!process.env.CI) {
  octokit = new Octokit({
    auth: process.env.GITHUB_API_TOKEN,
  });
}

const orgName = "MultiRepoActions";

const repos = await getReposForOrg(octokit, orgName);

const validRepos = await getReposWithPackageJson(octokit, orgName, repos);

// update repos where the package.json has either dependencies or devDependencies that match the name of the provided package.

const reposToUpdate = validRepos.map(async (repo) => {
  const packageJson = await getPackagesJsonFromRepoContent(
    octokit,
    orgName,
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

await Promise.all(reposToUpdate).then((repos) => {
  console.log(repos);
});

// console.log(reposToUpdate);

// console.log(validRepos);
