import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import type { CodeSnippet, CreateSnippetFormData } from "../../type";

import { useUpdateSnippet } from "../../hooks/useUpdateSnippet";
import { useAuth } from "../../context/AuthContext";
import { invokeEmbedFunction } from "../../services/supabase";

import { useInsertSnippet } from "../../hooks/useInsertSnippet";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
interface SnippetFormProps {
  initialSnippet?: CodeSnippet;
  // onClose?: () => void;
  onCloseModal?: () => void;
}

export const SnippetForm: React.FC<SnippetFormProps> = ({
  initialSnippet,
  onCloseModal,
}) => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSnippetFormData>({
    defaultValues: initialSnippet
      ? {
          title: initialSnippet.title,
          code: initialSnippet.code,
          language: initialSnippet.language,
          description: initialSnippet.description,
          tags: Array.isArray(initialSnippet.tags)
            ? initialSnippet.tags.join(", ")
            : "",
        }
      : {
          title: "",
          code: "",
          language: "",
          description: "",
          tags: "",
        },
  });

  const {
    mutate: insertSnippet,
    isPending: isInserting,
    error: insertError,
  } = useInsertSnippet();
  const {
    mutate: updateSnippet,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateSnippet();

  const onSubmit: SubmitHandler<CreateSnippetFormData> = async (data) => {
    if (!user) {
      toast.error("You must be logged in to save a snippet.");
      return;
    }

    try {
      const contentToEmbed = `Title: ${data.title}\nLanguage: ${data.language}\nCode: ${data.code}`;
      console.log("Generating embedding for content...");
      const embeddingArray = await invokeEmbedFunction(contentToEmbed);
      console.log("Embedding generated successfully.");

      const snippetPayload = {
        title: data.title,
        code: data.code,
        language: data.language,
        description: data.description || undefined,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        user_id: user.id,
        embedding_vectors: JSON.stringify(embeddingArray),
      };

      if (initialSnippet) {
        updateSnippet(
          {
            id: initialSnippet.id,
            updates: snippetPayload,
          },
          {
            onSuccess: () => {
              toast.success("Snippet updated successfully!");
              onCloseModal?.();
            },
            onError: (err) => {
              toast.error(`Failed to update: ${err.message}`);
            },
          },
        );
      } else {
        insertSnippet(
          {
            ...snippetPayload,
            is_pinned: false,
          },
          {
            onSuccess: () => {
              toast.success("Snippet created successfully!");
              reset();
              onCloseModal?.();
            },
          },
        );
      }
    } catch (error) {
      console.error("Failed to generate embedding or save snippet:", error);

      if (error instanceof Error) {
        toast.error(`An error occurred: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred. Please check the console.");
      }
    }
  };

  const buttonText = initialSnippet
    ? isSubmitting || isUpdating
      ? "Updating..."
      : "Save Changes"
    : isSubmitting || isInserting
      ? "Creating..."
      : "Create Snippet";

  const isLoading = isSubmitting || isInserting || isUpdating;
  const currentError = insertError
    ? insertError
    : updateError
      ? updateError
      : null;

  if (!user?.id) {
    return (
      <div className="text-center text-gray-400">Fetching user data...</div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-zinc-900 p-6 rounded-lg shadow-lg mb-8 min-w-[39rem]"
    >
      <h2 className="text-2xl font-bold text-zinc-400 mb-6">
        {initialSnippet ? "Edit Snippet" : "Create New Snippet"}
      </h2>

      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-zinc-500 text-md font-bold mb-2"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register("title", {
            required: "Title is required",
            maxLength: {
              value: 50,
              message: "Title cannot exceed 50 characters.",
            },
          })}
          className="shadow appearance-none border rounded w-full py-2 px-3  leading-tightflkv   focus:ring    focus:ring-zinc-400    focus:ring-opacity-20    focus:outline-none  bg-zinc-900 text-zinc-400 text-md border-gray-600"
          placeholder="e.g., React Hooks Best Practices"
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-red-500 text-xs italic mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="code"
          className="block text-zinc-400 text-md font-bold mb-2"
        >
          Code
        </label>
        <textarea
          id="code"
          {...register("code", { required: "Code is required" })}
          className="shadow  appearance-none border rounded w-full py-2 px-3 leading-tight  focus:ring    focus:ring-zinc-400    focus:ring-opacity-20    focus:outline-none  bg-zinc-800 text-zinc-200 text-md border-gray-600 h-32 font-mono"
          placeholder={`function App() {\n  // your code here\n}`}
          disabled={isLoading}
        ></textarea>
        {errors.code && (
          <p className="text-red-500 text-xs italic mt-1">
            {errors.code.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="language"
          className="block text-zinc-400 text-md font-bold mb-2"
        >
          Language
        </label>
        <input
          id="language"
          type="text"
          {...register("language", { required: "Language is required" })}
          className="   border    rounded    w-full    py-2    px-3    leading-tight    focus:ring    focus:ring-zinc-400    focus:ring-opacity-20    focus:outline-none    bg-zinc-800    text-zinc-200    text-md    border-gray-600 "
          placeholder="e.g., react, hooks, state, frontend"
          disabled={isLoading}
        />
        {errors.language && (
          <p className="text-red-500 text-xs italic mt-1">
            {errors.language.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-zinc-400 text-md font-bold mb-2"
        >
          Description (Optional)
        </label>

        <textarea
          {...register("description", {
            validate: (value: string | undefined) => {
              const wordCount = (value ?? "")
                .split(" ")
                .filter((word) => word).length;
              return wordCount <= 60 || "Description must be 60 words or less.";
            },
          })}
          className=" shadow   appearance-none   border   rounded   w-full   py-2   px-3   leading-tight   focus:outline-none   bg-zinc-800   text-zinc-200   text-md   border-gray-600    focus:ring   focus:ring-zinc-300   focus:ring-opacity-20  h-20"
          placeholder="A brief explanation of the code"
          disabled={isLoading}
        ></textarea>
      </div>

      <div className="mb-6">
        <label
          htmlFor="tags"
          className="block text-zinc-400  text-md font-bold mb-2"
        >
          Tags (Comma-separated, Optional)
        </label>
        <input
          id="tags"
          type="text"
          {...register("tags")}
          className="    shadow     appearance-none     border     rounded     w-full     py-2     px-3     leading-tight     focus:outline-none     bg-zinc-800     text-zinc-200     text-md     border-gray-600        focus:ring     focus:ring-zinc-300     focus:ring-opacity-20  "
          placeholder="e.g., react, hooks, state, frontend"
          disabled={isLoading}
        />
      </div>

      <div className="flex  justify-left center gap-4 ">
        <button
          type="submit"
          disabled={isLoading}
          className="   flex items-center justify-center  border-zinc-500 border-2 hover:bg-zinc-800 hover:text-zinc-400    min-h-[40px] text-zinc-400 font-bold    py-2 px-4 rounded    focus:outline-none focus:shadow-outline    disabled:opacity-50 disabled:cursor-not-allowed
    "
        >
          {isLoading ? <LoadingSpinner sizeClass="h-5 w-5" /> : buttonText}
        </button>

        <button
          type="button"
          onClick={onCloseModal}
          className="border-zinc-500 border-2 ml-4 hover:bg-zinc-800 hover:text-zinc-400    text-zinc-400 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>

      {currentError && (
        <p className="text-red-500 text-sm mt-3">
          Error: {currentError?.message}
        </p>
      )}
    </form>
  );
};

export default SnippetForm;
