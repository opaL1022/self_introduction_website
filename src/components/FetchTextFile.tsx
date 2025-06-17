// src/components/FetchTextFile.tsx
import React, { useEffect, useState } from "react";

export default function FetchTextFile({ filePath }: { filePath: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent(null);
    setError(null);
    fetch(filePath)
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.text();
      })
      .then(setContent)
      .catch((e) => setError(e.message));
  }, [filePath]);

  if (error) return <div style={{ marginLeft: 32 }}>{error}</div>;
  if (content === null) return <div style={{ marginLeft: 32 }}>Loading...</div>;

  const lineRegex = /^([^:]+):\s*(https?:\/\/\S+)\s*$/i;

  return (
    <div
      style={{
        marginLeft: 32,
        fontFamily: "monospace",
        color: "#fff",
        whiteSpace: "pre-wrap",
        lineHeight: 1.4,
      }}
    >
      {content.split("\n").map((line, idx, arr) => {
        const match = line.match(lineRegex);
        if (match) {
          const [, label, url] = match;
          return (
            <React.Fragment key={idx}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#fff", textDecoration: "underline" }}
              >
                {label}
              </a>
              {idx < arr.length - 1 && "\n"}
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={idx}>
              {line}
              {idx < arr.length - 1 && "\n"}
            </React.Fragment>
          );
        }
      })}
    </div>
  );
}
