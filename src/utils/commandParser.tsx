import React from 'react';
import FetchLs from '@/components/FetchLs';
import FetchTextFile from '@/components/FetchTextFile';

export interface CommandResult {
  output: string | React.ReactNode;
  newPathStack?: string[];  // for 'cd'
  newColorMode?: "white" | "green"; 
}



export async function parseCommand(
  input: string,
  currentPathStack: string[]
): Promise<CommandResult> {
  const [rawcmd, ...args] = input.trim().split(/\s+/);

  const cmd = rawcmd.toLowerCase();

  switch (cmd) {
    case 'help':
      return {
        output: (
          <div>
            <div>Available commands:</div>
            <div><span className="text-white">HELP</span> - Show command lists</div>
            <div><span className="text-white">CD route</span> - Switch pages (ex: <span className="text-white">cd /about</span>)</div>
            <div><span className="text-white">TYPE filename.txt</span> - Show the content of a text file under current route (ex: <span className="text-white">type about.txt</span>)</div>
            <div><span className="text-white">CLS</span> - Clear the terminal screen</div>
            <div><span className="text-white">DIR</span> - List all available files and subroutes under current route</div>
            <div><span className="text-white">green</span> - H4ck3r 5tylE</div>
            <div><span className="text-white">white</span> - Set theme color to white</div>
          </div>
        )
      };

    case "cd": {
      if (args.length !== 1) {
        return { output: "Usage: cd [path]" };
      }
      const target = args[0];

      let newStack: string[];
      if (target.startsWith("/")) {
        const segs = target.split("/").filter(Boolean);
        newStack = [""].concat(segs);
      } else if (target === "" || target === "/") {
        newStack = [""];
      } else {
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

      const rel = newStack.join("/").replace(/^\/+/, "");
      const res = await fetch(`/api/ls?path=${encodeURIComponent(rel)}`);

      if (!res.ok) {
        return {
          output: `Directory not found: ${target}`,
        };
      }
      return {
        output: `Switched to ${"/" + rel || "/"}`,
        newPathStack: newStack,
      };
    }

    case "type": {
      if (args.length !== 1) {
        return { output: "Usage: cat [filename.txt]" };
      }
      const filename = args[0];

      const dirPath = currentPathStack.join("/");      // e.g. '' or 'about/team'
      const normalizedDir =
        dirPath === "" ? "/" : "/" + dirPath.replace(/^\/+/, "");
      const apiPath = `${normalizedDir}/${filename}`.replace(/^\/+/, "");

      return {
        output: (
          <FetchTextFile
            filePath={`/api/cat?path=${encodeURIComponent(apiPath)}`}
          />
        ),
      };
    }

    case "dir": {
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
    case "cls": {
    return { output: "", newPathStack: currentPathStack };
  }
  
  case "green":
    return { output: "Switched color to green ", newColorMode: "green" };

  case "white":
    return { output: "Switched color to white ", newColorMode: "white" };
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
