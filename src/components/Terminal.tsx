"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from 'next/navigation';

export default function Home() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

   // 這裡呼叫 usePathname
  const pathname = usePathname();

  const getPromptPath = (pathname: string) => {
    if (pathname === "/") return "C:/";
      return `C:${pathname}`;
  };

  const promptPath = getPromptPath(pathname);

  useEffect(() => {
    const onClick = () => inputRef.current?.focus({ preventScroll: true });
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'auto',
      });
    }
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("User entered command:", input);
      setHistory(prev => [...prev, input]);
      setInput("");
    }
  };

  // CSS 設定
  const styles = {
    root: {
      minHeight: '100vh',
      background: 'black',
      color: '#22d066',
      padding: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      cursor: 'text',
      userSelect: 'text' as const,
    },
    terminalOutput: {
      overflowY: 'auto' as const,
      marginBottom: 0,
    },
    row: {
      display: 'flex',
      alignItems: 'center',
    },
    prompt: {
      marginRight: 8,
    },
    fakeInput: {
      flex: 1,
      minHeight: '1.5em',
      outline: 'none',
      background: 'transparent',
      color: '#22d066',
      caretColor: '#22d066',
      whiteSpace: 'pre',
      cursor: 'text',
      display: 'inline-block',
      position: 'relative' as const,
    },
    blink: {
      display: 'inline-block',
      width: 8,
      height: '1em',
      background: '#22d066',
      verticalAlign: 'bottom',
      animation: 'blink-cursor 1s steps(2, start) infinite',
      marginLeft: 1,
    },
    realInput: {
      opacity: 0,
      pointerEvents: 'none' as const,
      width: 1,
      height: 1,
    },
    gray: { color: '#888' },
    white: { color: '#fff' },
  };

  // 注入 blink 動畫
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes blink-cursor {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const focusInput = () => {
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div style={styles.root} onClick={focusInput}>
      <div id="terminal-output" style={styles.terminalOutput}>
        <p>[version 1.0.0] <span style={styles.gray}>Welcome to our website!</span></p>
        <p>Type <span style={styles.white}>help</span> to list commands.</p>
      </div>

      {history.map((cmd, i) => (
          <div key={i} style={styles.row}>
            <span style={styles.prompt}>{promptPath}&gt;</span>
            <span>{cmd}</span>
          </div>
        ))}

      <div ref={endRef} />
      <div style={styles.row}>
        <span style={styles.prompt}>{promptPath}&gt;_</span>
        {/* 假輸入框 */}
        <span
          style={styles.fakeInput}
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          {input}
          <span style={styles.blink} />
        </span>

        {/* 隱藏的真正 input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.realInput}
          tabIndex={-1}
          // autoFocus
        />
      </div>
    </div>
  );
}

// function getPromptPath(pathname: string) {
//   if (pathname === "/") return "C:/";
//   return `C:${pathname}`;
// }