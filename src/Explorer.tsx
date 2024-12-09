import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { chain } from "./chain";
import { world } from "./contract";

export function Explorer() {
  const [open, setOpen] = useState(false);
  const explorerUrl = chain?.blockExplorers?.worldsExplorer?.url;
  if (!explorerUrl) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 flex flex-col opacity-80 transition hover:opacity-100">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="outline-none text-right p-2 leading-none text-black"
      >
        {open ? "Close" : "Explore"}
      </button>
      <iframe
        src={`${explorerUrl}/${world.address}`}
        className={twMerge("transition-all", open ? "h-[50vh]" : "h-0")}
      />
    </div>
  );
}
