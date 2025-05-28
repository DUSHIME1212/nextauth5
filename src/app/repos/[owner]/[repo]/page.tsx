import { getUserData } from "@/components/getUserData";
import RepoDetails from "@/components/RepoDetails";
import RepoAnalysis from "@/components/RepoAnalysis";
import RepoContents from "@/components/RepoContents";
import { createAIClient, generateRepoSummary } from "@/lib/ai";
import {
  createGitHubClient,
  getRepoDetails,
  getRepoContents,
} from "@/lib/octokit";
import { Suspense } from "react";
import Link from "next/link";

interface pageparams{ owner: string; repo: string }

export default async function RepoPage({
  params,
}: {
  params: Promise<pageparams>;
}) {
  const user = await getUserData();

  const { owner, repo } = await params;

  if (!user) {
    return <div>Please sign in to view this repository.</div>;
  }

  const accessToken = user.accounts?.[0]?.access_token;
  if (!accessToken) {
    return <div>Access token not found. Please check your account settings.</div>;
  }

  const octokit = await createGitHubClient(accessToken);
  const aiClient = createAIClient(process.env.GEMINI_API_KEY!);

  const repoDetails = await getRepoDetails(octokit, owner, repo);
  const repoContents = await getRepoContents(octokit, owner, repo);
  let repoSummary;
  try {
    repoSummary = await generateRepoSummary(aiClient, repoDetails);
  } catch (error) {
    console.error("Error generating repo summary:", error);
    repoSummary = "Repository summary is currently unavailable. Please try again later.";
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <Link href={'/'} className="mb-6 text-3xl font-bold">{repoDetails.name}</Link>
      <Suspense fallback={<div>Loading repository details...</div>}>
        <RepoDetails repo={repoDetails} />
      </Suspense>
      <Suspense fallback={<div>Loading repository analysis...</div>}>
        <RepoAnalysis
          repoSummary={repoSummary}
          owner={owner}
          repo={repo}
          aiClient={aiClient}
        />
      </Suspense>
      <Suspense fallback={<div>Loading repository contents...</div>}>
        <RepoContents
          contents={repoContents}
          owner={owner}
          repo={repo}
          accessToken={accessToken}
        />
      </Suspense>
    </div>
  );
}