import { GoogleGenerativeAI } from "@google/generative-ai";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createAIClient(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey || "");
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
}

async function generateContentWithRetry(model: any, prompt: string, retries = 3, backoff = 1000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      if (attempt === retries) {
        throw error;
      }
      // Retry only on 503 errors (model overloaded)
      if (error?.message?.includes("503") || error?.message?.includes("overloaded")) {
        await sleep(backoff * Math.pow(2, attempt)); // exponential backoff
      } else {
        throw error;
      }
    }
  }
}

export async function analyzeCodeWithAI(model: any, context: string, question: string) {
  const prompt = 
    "You are a helpful AI assistant analyzing a GitHub repository.\n" +
    "Here is the context from the repository:\n" +
    context + "\n\n" +
    "Answer the following question about this repository:\n" +
    question + "\n";

  return await generateContentWithRetry(model, prompt);
}

export async function generateCodeReview(model: any, diff: string) {
  const prompt = 
    "Please review the following code changes from a GitHub commit diff:\n" +
    diff + "\n\n" +
    "Provide a detailed code review including:\n" +
    "1. Potential bugs or issues\n" +
    "2. Code style improvements\n" +
    "3. Performance considerations\n" +
    "4. Security concerns\n" +
    "5. Overall assessment\n";

  return await generateContentWithRetry(model, prompt);
}

export async function generateRepoSummary(model: any, repoDetails: any) {
  const prompt = 
    "Generate a comprehensive summary of this GitHub repository:\n\n" +
    "Repository Name: " + repoDetails.name + "\n" +
    "Description: " + (repoDetails.description || 'No description') + "\n" +
    "Primary Language: " + repoDetails.language + "\n" +
    "Stars: " + repoDetails.stargazers_count + "\n" +
    "Forks: " + repoDetails.forks_count + "\n" +
    "Open Issues: " + repoDetails.open_issues_count + "\n" +
    "Last Updated: " + repoDetails.updated_at + "\n\n" +
    "Please provide a detailed summary including:\n" +
    "1. The likely purpose of the repository\n" +
    "2. Key technologies used\n" +
    "3. Project health indicators\n" +
    "4. Notable features based on the available data\n";

  return await generateContentWithRetry(model, prompt);
}
