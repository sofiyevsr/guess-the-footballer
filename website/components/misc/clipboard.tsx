import ClipboardIcon from "@heroicons/react/20/solid/ClipboardIcon";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  label: string;
}

export default function Clipboard({ text, label }: Props) {
  const [message, setMessage] = useState(label);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  return (
    <div
      className="flex items-center justify-between bg-black p-4 rounded-xl cursor-pointer hover:outline hover:outline-primary"
      onClick={async () => {
        if (timerRef.current != null) return;
        try {
          await navigator.clipboard.writeText(text);
          setMessage("Copied!");
        } catch (error) {
          setMessage("Cannot copy");
        }
        timerRef.current = setTimeout(() => {
          setMessage(label);
          timerRef.current = undefined;
        }, 3000);
      }}
    >
      <p className="font-bold">{message}</p>
      <button className="btn btn-md btn-square p-3">
        <ClipboardIcon />
      </button>
    </div>
  );
}