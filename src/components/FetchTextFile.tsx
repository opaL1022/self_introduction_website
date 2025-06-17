// components/FetchTextFile.tsx
import React, { useState, useEffect } from "react";

export default function FetchTextFile({
  filePath,
}: {
  filePath: string;
}) {
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
      .catch(() => setError(`File not found: ${filePath}`));
  }, [filePath]);

  if (error) return <div>{error}</div>;
  if (content === null) return <div>Loading...</div>;
  return <div>{content}</div>;
}
