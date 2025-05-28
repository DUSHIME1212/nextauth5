import { getUserData } from "@/components/getUserData";
import RepoDetails from "@/components/RepoDetails";
import { createAIClient } from "@/lib/ai";
import RepoCard from "@/components/RepoCard";
import {
  createGitHubClient,
  getRepoContents,
  getRepoDetails,
  getUserRepos,
} from "@/lib/octokit";
import { Suspense } from "react";

export default async function Rootpage() {
  const user = await getUserData();

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  const accessToken = user.accounts?.[0]?.access_token;
  if (!accessToken) {
    return (
      <div>Access token not found. Please check your account settings.</div>
    );
  }

  const octokit = await createGitHubClient(accessToken);
  const aiClient = createAIClient(process.env.GEMINI_API_KEY!);
  const { repos } = await getUserRepos(octokit);

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className="p-8 md:p-16 lg:p-32">
      <h1 className="mb-6 text-3xl font-bold">Repository Explorer</h1>
      <Suspense fallback={<div>Loading repositories...</div>}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </Suspense>
    </div>
  );
}
