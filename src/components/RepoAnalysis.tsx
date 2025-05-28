import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Markdown from 'react-markdown'

interface RepoAnalysisProps {
  repoSummary: string
  owner: string
  repo: string
  aiClient: any
}

export default async function RepoAnalysis({ repoSummary, owner, repo, aiClient }: RepoAnalysisProps) {
  // Generate code quality analysis
  const codeQualityPrompt = `
    You are analyzing the GitHub repository ${owner}/${repo}.
    Based on the repository structure and content, provide a brief assessment of:
    1. Code organization and architecture
    2. Potential areas for improvement
    3. Best practices being followed
    Keep your response concise and focused on actionable insights.
  `

  let codeQualityAnalysis = "Analysis not available"
  try {
    codeQualityAnalysis = await aiClient
      .generateContent(codeQualityPrompt)
      .then((result: any) => result.response.text())
  } catch (error) {
    console.error("Error generating code quality analysis:", error)
  }

  // Generate security recommendations
  const securityPrompt = `
    You are analyzing the GitHub repository ${owner}/${repo} for security considerations.
    Provide a brief assessment of:
    1. Potential security vulnerabilities to check for
    2. Security best practices to implement
    3. Recommendations for improving security posture
    Keep your response concise and focused on actionable security recommendations.
  `

  let securityAnalysis = "Analysis not available"
  try {
    securityAnalysis = await aiClient.generateContent(securityPrompt).then((result: any) => result.response.text())
  } catch (error) {
    console.error("Error generating security analysis:", error)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Repository Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="quality">Code Quality</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium">Repository Overview</h3>
                <Markdown>{repoSummary}</Markdown>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="mt-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium">Code Quality Assessment</h3>
                <Markdown>{codeQualityAnalysis}</Markdown>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium">Security Recommendations</h3>
                <Markdown>{securityAnalysis}</Markdown>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
