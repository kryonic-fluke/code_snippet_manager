import type { CodeSnippet } from "../../type/index";
import {getLanguageIcon} from "../../getLanguageIcon";
import { HiBookmark } from "react-icons/hi";
import Modal from "../../ui/Modal";
import { SnippetView } from "./SnippetView";
import { useDeleteSnippet } from "../../hooks/useDeleteSnippet";
import { useUpdateSnippet } from "../../hooks/useUpdateSnippet";
import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmModal } from "../ConfirmModal";

interface SnippetCardProps {
  snippet: CodeSnippet;
}

export const SnippetCard = ({ snippet }: SnippetCardProps) => {
  const { mutate: deleteSnippet } = useDeleteSnippet();
  const { mutate: updatePinStatus } = useUpdateSnippet();
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [isOpend, setIsOpend]=  useState(false);
  const [isPinned, setIsPinned] = useState(snippet.is_pinned);

  const handleDelete = (e: React.MouseEvent,snippetId: string) => {
    e.stopPropagation();
    setIsOpend(true);
  setSnippetToDelete(snippetId); 
 };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();

    const newPinStatus = !isPinned;
    setIsPinned(newPinStatus);
    updatePinStatus({ id: snippet.id, updates: { is_pinned: newPinStatus } },{  onSuccess: () => {
                const message = newPinStatus ? "Snippet pinned!" : "Snippet unpinned!";
                toast.success(message);
            },
            onError: () => {
                setIsPinned(!newPinStatus); 
                toast.error("Failed to update pin status. Please try again.");
                // console.error("Pin update failed:", error);
            }
        }
    );
}

;


  return (
<>
    <Modal>
      <Modal.Open opens={`view-snippet-${snippet.id}`}>
        <div
          className="group  rounded-lg  overflow-hidden  hover:scale-105 transform transition-all duration-300 ease-in-out  hover:cursor-pointer hover:shadow-2xl  w-full flex flex-col h-full"
        >
          <div className="h-[9.9rem] w-full relative">
            <div className="flex absolute justify-center items-center top-[-0.6rem] left-[-0.3rem] z-10 gap-3">
              <button
                onClick={handlePin}
                className="text-gray-600 hover:text-blue-500 transition-colors"
              >
                <HiBookmark
                  size="60"
                  className={isPinned ? "text-blue-500" : "text-gray-600"}
                />{" "}
              </button>
            </div>

            <img
              src={`${getLanguageIcon(snippet.language)}`}
              className="h-full w-full object-contain bg-white "
            />
          </div>

          <div className="flex flex-col flex-grow justify-between border-2 border-gray-600 rounded-b-lg pt-2 pl-3 pb-2 pr-3">
            <div>
              <h1
                className="font-mono font-bold truncate text-lg mb-1 text-zinc-300 "
                title={snippet.title}
              >
                {snippet.title}
              </h1>
              <div className="overflow-hidden font-mono text-zinc-300">
                <p className="line-clamp-2" title={snippet.description}>
                  {snippet.description
                    ? snippet.description
                    : "No description added"}
                </p>
              </div>
            </div>

            <div className="flex self-end gap-4 mt-2">
              <Modal.Open opens={`view-snippet-${snippet.id}`}>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="border-2 border-zinc-400 hover:text-blue-700 active:ring active:ring-blue-400  active:outline-none over: transition-colors duration-350 ease-in-out  px-[0.8rem] py-[0.3rem] rounded-lg  font-medium"
                >
                  Open
                </button>
              </Modal.Open>

              <button onClick={(e) => handleDelete(e, snippet.id)}
                className=" border-zinc-400 transition-colors duration-350 ease-in-out px-2 border-2 hover:text-red-500 rounded-lg font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </Modal.Open>

      <Modal.Window name={`view-snippet-${snippet.id}`}>
        <SnippetView snippet={snippet} />
      </Modal.Window>
    </Modal>

    <ConfirmModal isOpen={isOpend} title="Delete Snippet" message="Are you sure you want to delete this snippet?"onConfirm={() => {
    if (snippetToDelete) {
      deleteSnippet(snippetToDelete);
      
      setSnippetToDelete(null); 
      setIsOpend(false); 
    }
  }} onCancel={() => setIsOpend(false)}   confirmText="Delete"/>
    </>
  );
};
