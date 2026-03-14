import { supabase } from "../supabaseClient";
import type { CodeSnippet, SnippetSearchResult ,CodeSnippetPayload } from "../type/index";

export const getAllSnippets = async (userId: string, limit?: number): Promise<CodeSnippet[]> => {
  let query = supabase
    .from('codesnippet')
    .select('*')
    .eq('user_id', userId)
     .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false }); 
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const insertSnippet = async (
  snippet: Omit<CodeSnippetPayload, "id" | "created_at" >
): Promise<CodeSnippet> => {
  const { data, error } = await supabase
    .from("codesnippet")
    .insert([snippet])
    .select() 
    .single();

  if (error) {
    console.error("Error inserting snippet into Supabase:", error);
    throw new Error(error.message);
  }

  return data;
};



export  const updateSnippet = async (id: string, updates: Partial<CodeSnippetPayload>): Promise<CodeSnippet> => {
  const { data, error } = await supabase
    .from('codesnippet')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}



export const deleteSnippet = async (id: string): Promise<void> => {
  const { error } = await supabase.from("codesnippet").delete().eq("id", id);
  if (error) {
    console.error("Error deleting snippet from Supabase:", error);
    throw new Error(error.message); 
  }
  return;
};




export const invokeEmbedFunction = async (inputText: string): Promise<number[]> => {
  console.log("inputext invoked fn",inputText);
  
  const { data, error } = await supabase.functions.invoke('embed', {
    body: JSON.stringify({inputText}),
  });
 if (error) {
    console.error("Error invoking embed function:", error.message);
    throw new Error(error.message); 
  }
  
  return data?.embedding;
}

export const matchCodeSnippets = async (embedding_vectors: number[]): Promise<SnippetSearchResult[]> => {

  const { data, error } = await supabase.rpc('match_code_snippets', {
    query_embedding: embedding_vectors,
    match_threshold: 0.55,
    match_count: 5,
  });
  if (error) throw error;
  return data || [];
}


export const reviewSnippet = async(code: string):Promise<{review:string}>=>{
  console.log("review api called",code);
  
  
  const {data,error} = await supabase.functions.invoke('reviewSnippetCode',{
    body:{code},
  })
  if(error) throw error;
  return  { review: data.review };

}