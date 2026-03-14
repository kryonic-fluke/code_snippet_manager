import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const API_KEY = Deno.env.get("GOOGLE_API_KEY");
if (!API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); 

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let reqBody;
    try {
        reqBody = await req.json();
    } catch {
        throw new Error("Invalid or missing JSON Payload Sent."); 
    }
    
    const { code } = reqBody;

    if (typeof code !== "string" || code.trim() === "") {
        return new Response(JSON.stringify({ error: "No 'code' provided in the request body." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    const prompt = `
You are an expert AI code reviewer. Your tone is professional and constructive.
Analyze the following code snippet and provide feedback in a structured, easy-to-read format.
Your response must be in Markdown and MUST include the following three sections using H3 (###) headers:
### What's Done Well
- Briefly mention 1-2 positive aspects (e.g., good variable names, clear logic, good use of hooks).
### Potential Issues & Bugs
- Clearly identify any critical bugs, type mismatches, or logical errors. Use bullet points.
- If an issue is a critical concern, make the text **bold**.

### Suggestions for Improvement
- Provide actionable advice on best practices, performance, or readability. Use bullet points.
- When suggesting a code change, include a small, corrected code example in a fenced code block.
Do not provide a long, unstructured wall of text. Keep the analysis concise and focused on the key points.

Here is the code to review:
\`\`\`
${code}
\`\`\`
`;
    const result = await model.generateContent(prompt);
    
    const reviewText = result.response.text();

    return new Response(JSON.stringify({ review: reviewText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error in reviewSnippetCode function Caught Internally:", errorMessage);

    return new Response(JSON.stringify({ error: "Failed code evaluation process." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});