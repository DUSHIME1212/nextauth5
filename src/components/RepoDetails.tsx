import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, GitBranchIcon, GitCommitIcon } from "lucide-react"

export default function RepoDetails({ repo }: { repo: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Repository Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1">{repo.description || "No description provided"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Languages</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {repo.languages?.map((lang: string) => (
                <Badge key={lang} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                {new Date(repo.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="mt-1 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                {new Date(repo.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Default Branch</h3>
              <p className="mt-1 flex items-center gap-2">
                <GitBranchIcon className="h-4 w-4 text-gray-400" />
                {repo.default_branch}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">License</h3>
              <p className="mt-1">{repo.license?.name || "No license"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Commits</h3>
            <div className="space-y-3">
              {repo.recentCommits?.slice(0, 3).map((commit: any) => (
                <div key={commit.sha} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={commit.author?.avatar_url || "/placeholder.svg"}
                      alt={commit.author?.login || "Author"}
                    />
                    <AvatarFallback>{commit.author?.login?.substring(0, 2).toUpperCase() || "AU"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{commit.commit.message}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <GitCommitIcon className="h-3 w-3" />
                      {commit.sha.substring(0, 7)} by {commit.author?.login || commit.commit.author.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Collaborators</h3>
            <div className="flex flex-wrap gap-2">
              {repo.collaborators?.slice(0, 5).map((collaborator: any) => (
                <div key={collaborator.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={collaborator.avatar_url || "/placeholder.svg"} alt={collaborator.login} />
                    <AvatarFallback>{collaborator.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{collaborator.login}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
