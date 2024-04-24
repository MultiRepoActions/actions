export async function getReposForOrg(octokit, org) {
  const repoData = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org: org,
  });
  return repoData.map((repo) => repo.name);
}

export async function getPackagesJsonFromRepo(octokit, owner, repo) {
  return await octokit.rest.repos.getContent({
    owner: owner,
    repo: repo,
    path: "package.json",
  });
}

/**
 *
 *
 * @export
 * @param {*} octokit - octokit instance
 * @param {string} owner - owner org of the repo
 * @param {string} repo - repo/package name
 * @param {string} branch - target branch to get the package.json file from
 * @return {*}
 */
export async function getPackagesJsonFromRepoContent(
  octokit,
  owner,
  repo,
  branch = "main",
) {
  const fileApiData = await octokit.rest.repos.getContent({
    owner: owner,
    repo: repo,
    path: "package.json",
    ref: branch,
  });

  // decode the base64 encoded content
  const fileContent = Buffer.from(
    fileApiData.data.content,
    "base64",
  ).toString();
  return JSON.parse(fileContent);
}

export const getReposWithPackageJson = async (octokit, org, repos) => {
  const reposWithPackageJson = [];
  for (const repo of repos) {
    try {
      await getPackagesJsonFromRepo(octokit, org, repo);
      reposWithPackageJson.push(repo);
    } catch (error) {
      console.log(`No package.json found in root of ${repo}... skipping.`);
    }
  }
  return reposWithPackageJson;
};

// getReposForOrg(octokit, '').then((repos) => {
//     console.log(repos)
// });
