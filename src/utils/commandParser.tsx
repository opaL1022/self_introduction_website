import React from 'react';
import FetchLs from '@/components/FetchLs';
import FetchTextFile from '@/components/FetchTextFile';

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
            <div><span className="text-white">clear</span> / <span className="text-white">cls</span> - Clear the terminal screen</div>
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

    case "cat": {
      if (args.length !== 1) {
        return { output: "Usage: cat [filename.txt]" };
      }
      const filename = args[0];

      // 用 currentPathStack（函式引入的）来计算当前目录
      const dirPath = currentPathStack.join("/");      // e.g. '' or 'about/team'
      // 规范成 '/about/team' 或根目录 '/'
      const normalizedDir =
        dirPath === "" ? "/" : "/" + dirPath.replace(/^\/+/, "");
      // 拼出 API 参数里要传的相对路径：去掉开头多余的 '/'
      const apiPath = `${normalizedDir}/${filename}`.replace(/^\/+/, "");

      return {
        output: (
          <FetchTextFile
            filePath={`/api/cat?path=${encodeURIComponent(apiPath)}`}
          />
        ),
      };
    }


    case "ls": {
      const target = args[0] || ".";
      return {
        output: (
          <FetchLs
            pathStack={currentPathStack}
            target={target}
          />
        )
      };
    }
    case "clear":
  case "cls": {
    // 通知父元件清空 terminal
    return { output: "", newPathStack: currentPathStack };
  }
    default:
      return { output: `Command not found: ${cmd}` };
  }
}

// 以 React 元件方式 fetch txt 檔案內容
// function FetchTextFile({ filePath }: { filePath: string }) {
//   const [content, setContent] = React.useState<string | null>(null);
//   const [error, setError] = React.useState<string | null>(null);

//   React.useEffect(() => {
//     setContent(null);
//     setError(null);
//     fetch(filePath)
//       .then(res => {
//         if (!res.ok) throw new Error('File not found');
//         return res.text();
//       })
//       .then(setContent)
//       .catch(() => setError(`File not found: ${filePath}`));
//   }, [filePath]);

//   if (error) return <div>{error}</div>;
//   if (content === null) return <div>Loading...</div>;
//   return <pre>{content}</pre>;
// }
