import React, { useEffect, useState } from "react";

type FetchLsProps = {
  pathStack: string[];
  target: string;       // e.g. ".", "..", "subdir", "/absolute"
};

export default function FetchLs({ pathStack, target }: FetchLsProps) {
  const [items, setItems] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 計算 query path
    let base = pathStack.join("/") || "";
    if (!base.startsWith("/")) base = "/" + base;
    
    let queryPath = "";
    if (target === "." || target === "") {
      queryPath = base;
    } else if (target.startsWith("/")) {
      queryPath = target;
    } else {
      queryPath = base.endsWith("/") ? base + target : base + "/" + target;
    }

    fetch(`/api/ls?path=${encodeURIComponent(queryPath)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Cannot list directory");
        return res.json() as Promise<string[]>;
      })
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [pathStack, target]);

  if (error) return <div>{error}</div>;
  if (items === null) return <div>Loading...</div>;

  return (
    <pre style={{ whiteSpace: 'pre-wrap', marginLeft: 32 }}>
      {items.join("   ")}
    </pre>
  );
}
