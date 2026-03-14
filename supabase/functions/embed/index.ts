import { GoogleGenerativeAI,TaskType  } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get("GOOGLE_API_KEY");
if (!API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let reqBody; 
    try {
        reqBody = await req.json();
    } catch  {
        throw new Error("Invalid or Missing JSON Payload Sent"); 
    }

    const { inputText } = reqBody;

    if (typeof inputText !== "string" || inputText.trim() === "") {
        return new Response(JSON.stringify({ error: "Valid text requirement not provided." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    const result = await model.embedContent({
       content: {role:'user', parts: [{ text: inputText }] 
      },
  taskType: TaskType.RETRIEVAL_QUERY, 
    });
    const embedding = result.embedding?.values;

    if (!embedding) {
      throw new Error("Google returned null embedding output.");
    }

    return new Response(JSON.stringify({ embedding }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, 
    });
    
  } catch (error) {
    console.error("Function Internal Error Caught:", error);
    
    return new Response(JSON.stringify({ error: "Failed resolving requested embeddings." }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});