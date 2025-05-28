// components/RepoCard.tsx
import Link from "next/link";
import { Card } from "./ui/card";

export default function RepoCard({ repo }: { repo: any }) {
  return (
    <Card className="border-2 border-black p-4 hover:shadow-lg transition-shadow bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            <Link href={`/repos/${repo.owner.login}/${repo.name}`}>
              {repo.name}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {repo.description || "No description"}
          </p>
        </div>
        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
          {repo.language || "Unknown"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {repo.topics?.map((topic: string) => (
          <span key={topic} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {topic}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <StatItem icon="⭐" value={repo.stargazers_count} />
        <StatItem icon="👀" value={repo.watchers_count} />
        <StatItem icon="⑂" value={repo.forks_count} />
        <StatItem icon="!" value={repo.open_issues_count} />
      </div>
    </Card>
  );
}

function StatItem({ icon, value }: { icon: string; value: number }) {
  return (
    <div className="flex items-center gap-1">
      <span>{icon}</span>
      <span>{value}</span>
    </div>
  );
}