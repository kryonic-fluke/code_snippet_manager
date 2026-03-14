import type { ReactNode } from "react";

export interface CodeSnippet {
  id: string;

  created_at: string;

  title: string;

  code: string;

  language: string;
  user_id: string | undefined;

  description?: string;
  tags?: string[];

  is_pinned: boolean;

  embedding_vectors?: number[];
}

export interface CreateSnippetFormData {
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string;
}

export const getTitle = (snippet: CodeSnippet): string => {
  const { title } = snippet;

  return title;
};

export const getIsPinned = (snippet: CodeSnippet): boolean => {
  const { is_pinned } = snippet;

  return is_pinned;
};

export type SnippetSearchResult = CodeSnippet & {
  similarity: number;
};

export type CodeSnippetPayload = Omit<CodeSnippet, "embedding_vectors"> & {
  embedding_vectors: string;
};

export interface CustomCodeProps {
  node?: any; 
  inline?: boolean;
  className?: string;
  // language:RegExp
  children?: ReactNode;
  [key: string]: any;
}