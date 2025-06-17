import React from 'react';

export interface CommandResult {
  output: string | React.ReactNode;
  newPathStack?: string[];  // for 'cd'
}



export function parseCommand(
  input: string,
  currentPathStack: string[]
): CommandResult {
  const [cmd, ...args] = input.trim().split(/\s+/);

  switch (cmd) {
    case 'help':
      return {
        output: (
          <div>
            <div>Available commands:</div>
            <div><span className="text-white">help</span> - Show command lists</div>
            <div><span className="text-white">cd route</span> - Switch pages (ex: <span className="text-white">cd /about</span>)</div>
            <div><span className="text-white">cat filename.txt</span> - Show the content of a text file under current route (ex: <span className="text-white">cat about.txt</span>)</div>
          </div>
        )
      };

    case "cd": {
      if (args.length !== 1) {
        return { output: "Usage: cd [path]" };
      }
      const target = args[0];
      // 建立 newStack 的邏輯（支援 ../, ./, 絕對 /, 相對）
      let newStack: string[];
      if (target.startsWith("/")) {
        // 絕對路徑
        const segs = target.split("/").filter(Boolean);
        newStack = [""].concat(segs);
      } else if (target === "" || target === "/") {
        newStack = [""];
      } else {
        // 複合相對
        newStack = [...currentPathStack];
        for (const seg of target.split("/")) {
          if (!seg || seg === ".") continue;
          if (seg === "..") {
            if (newStack.length > 1) newStack.pop();
          } else {
            newStack.push(seg);
          }
        }
      }
      return {
        output: `Switched to ${newStack.join("/") || "/"}`,
        newPathStack: newStack,
      };
    }

    case 'cat':
      if (args.length !== 1) {
        return { output: 'Usage: cat [filename.txt]' };
      }
      const filename = args[0];
      // 動態抓取 public 目錄下對應路由底下的 txt 檔案
      // 例如 /about 路由下 cat about.txt 會去抓 /about/about.txt
      // 這裡假設有個全域變數 currentRoute 代表目前路由
      // 你需要在 Terminal 元件中將目前路由傳進來
      // 這裡以 window.location.pathname 為例
      let route = '/';
      if (typeof window !== 'undefined') {
        route = window.location.pathname;
      }
      // 處理根路由
      let filePath = route.endsWith('/') ? `${route}${filename}` : `${route}/${filename}`;
      if (filePath.startsWith('//')) filePath = filePath.slice(1);

      // 取得 txt 檔案內容
      return {
        output: (
          <FetchTextFile filePath={filePath} />
        )
      };

    default:
      return { output: `Command not found: ${cmd}` };
  }
}

// 以 React 元件方式 fetch txt 檔案內容
function FetchTextFile({ filePath }: { filePath: string }) {
  const [content, setContent] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setContent(null);
    setError(null);
    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error('File not found');
        return res.text();
      })
      .then(setContent)
      .catch(() => setError(`File not found: ${filePath}`));
  }, [filePath]);

  if (error) return <div>{error}</div>;
  if (content === null) return <div>Loading...</div>;
  return <pre>{content}</pre>;
}
