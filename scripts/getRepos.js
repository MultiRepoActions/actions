import {Octokit} from '@octokit/rest';


let octokit;
if(!process.env.CI) {
  octokit = new Octokit({
    auth: process.env.GITHUB_API_TOKEN,
  });
} 

export async function getReposForOrg(octokit, org) {
  const repoData = await octokit.paginate( octokit.rest.repos.listForOrg, {
    org: org,
  });
  return repoData.map(repo => repo.full_name);
}

export async function getPackagesJsonFromRepo(octokit, owner, repo) {
  return await octokit.rest.repos.getContent({
    owner: owner,
    repo: repo,
    path: 'package.json',
  });
}

export async function getPackagesJsonFromRepoContent(octokit, owner, repo, branch) {
  return await octokit.rest.repos.getContent({
    owner: owner,
    repo: repo,
    path: 'package.json',
    ref: branch,
  });
}

// getReposForOrg(octokit, 'boostpi').then((repos) => {
//     console.log(repos)
// });