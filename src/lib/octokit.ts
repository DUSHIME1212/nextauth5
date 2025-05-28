// lib/github.ts
import { Octokit } from "@octokit/rest"

export async function createGitHubClient(token: string) {
  return new Octokit({
    auth: token,
    baseUrl: "https://api.github.com",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })
}

export async function getUserRepos(octokit: Octokit) {
  const { data: user } = await octokit.request("GET /user");
  const { data: repos } = await octokit.request("GET /user/repos", {
    visibility: "all",
    affiliation: "owner,collaborator,organization_member",
    per_page: 100,
    sort: "updated",
  });

  return { user, repos };
}

export async function getRepoDetails(octokit: Octokit, owner: string, repo: string) {
  const [
    { data: repoData },
    { data: languages },
    { data: collaborators },
    { data: commits },
    { data: issues },
  ] = await Promise.all([
    octokit.request("GET /repos/{owner}/{repo}", { owner, repo }),
    octokit.request("GET /repos/{owner}/{repo}/languages", { owner, repo }),
    octokit.request("GET /repos/{owner}/{repo}/collaborators", { owner, repo }),
    octokit.request("GET /repos/{owner}/{repo}/commits", { owner, repo, per_page: 5 }),
    octokit.request("GET /repos/{owner}/{repo}/issues", { owner, repo, state: 'open' }),
  ]);

  return {
    ...repoData,
    languages: Object.keys(languages),
    collaborators,
    recentCommits: commits,
    openIssues: issues,
  };
}

export async function getRepoContents(octokit: Octokit, owner: string, repo: string, path: string = ''): Promise<(Record<string, any> | Record<string, any>[])[]> {
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path,
  });

  // Recursively get contents for directories
  if (Array.isArray(data)) {
    const nestedContents = await Promise.all(
      data
        .filter((item: any) => item.type === 'dir')
        .map((item: any) => getRepoContents(octokit, owner, repo, item.path))
    );
    return [...data, ...nestedContents.flat()];
  }

  return Array.isArray(data) ? data : [data];
}

export async function getCommitDiff(octokit: Octokit, owner: string, repo: string, base: string, head: string) {
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/compare/{base}...{head}", {
    owner,
    repo,
    base,
    head,
  });

  return data.files || [];
}