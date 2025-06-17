"use client";
import { useState, useRef, useEffect } from "react";
import { parseCommand } from "../utils/commandParser";

import type { ReactNode } from "react";

export default function Home() {
  const [pathStack, setPathStack] = useState<string[]>(['']);
  const promptPath = 'C:' + pathStack.join('/');
  const [input, setInput] = useState("");
  const [cursorPos, setCursorPos] = useState(0);   
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<
    { path: string; cmd: string; output: ReactNode }[]
  >([]);

  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

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

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        setHistoryIndex(null);
        const result = await parseCommand(input, pathStack);
        setHistory((h) => [
          ...h,
          { path: promptPath, cmd: input, output: result.output },
        ]);

        if (result.newPathStack) {
        setPathStack(result.newPathStack);

        if (
          (input.trim() === "clear" || input.trim() === "cls") && result.output === ""
          ) {
            setHistory([]);
            setPathStack(['']);
            setInput("");
            return;
          }

      }

      setInput("");
      setCursorPos(0);
    }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex =
        historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex].cmd);
      setCursorPos((historyIndex !== null ? 
         history[historyIndex]?.cmd.length : input.length) || 0);
      e.preventDefault();
    }
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === null) return;
      const nextIndex =
        historyIndex + 1 >= history.length ? null : historyIndex + 1;
      setHistoryIndex(nextIndex);
      setInput(nextIndex === null ? "" : history[nextIndex].cmd);
      setCursorPos((historyIndex !== null ? 
         history[historyIndex]?.cmd.length : input.length) || 0);
      e.preventDefault();
    }
    else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCursorPos((pos) => Math.max(0, pos - 1));
      // 同步 real input 光标
      inputRef.current?.setSelectionRange(cursorPos - 1, cursorPos - 1);
    }
    else if (e.key === "ArrowRight") {
      e.preventDefault();
      setCursorPos((pos) => Math.min(input.length, pos + 1));
      inputRef.current?.setSelectionRange(cursorPos + 1, cursorPos + 1);
    }
  };

  // CSS 設定
  const styles = {
    root: {
      minHeight: '100vh',
      background: 'black',
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
      caretColor: '#fff',
      whiteSpace: 'pre',
      cursor: 'text',
      display: 'inline-block',
      position: 'relative' as const,
    },
    cursorBox: {
    position: 'relative' as const,
    display: 'inline-block' as const,
    width: '1ch',
    },

    blink: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: 'rgba(255,255,255,.5)',
      animation: 'blink-cursor 1s steps(2,start) infinite',
      pointerEvents: 'none' as const,
    },
    realInput: {
      opacity: 0,
      pointerEvents: 'none' as const,
      width: 1,
      height: 1,
    },
    output: {
      marginLeft: 32,
      whiteSpace: 'pre-wrap',
      lineHeight: 1.4,
    },
    gray: { color: '#888' },
    white: { color: '#fff' },
  };

  // blink animation
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // record cursor position
    const pos = e.target.selectionStart ?? e.target.value.length;
    setCursorPos(pos);
  };

  const focusInput = () => {
    inputRef.current?.focus({ preventScroll: true });
    inputRef.current?.setSelectionRange(cursorPos, cursorPos);
  };

  return (
    <div style={styles.root} onClick={focusInput}>
      <div id="terminal-output" style={styles.terminalOutput}>
        <p>[version 1.0.0] <span style={styles.gray}>Welcome to our website!</span></p>
        <p>Type <span style={styles.white}>help</span> to list commands.</p>
        {history.map((h, i) => (
          <div key={i}>
            <div style={styles.row}>
              <span style={styles.prompt}>{h.path}&gt;_</span>
              <span>{h.cmd}</span>
            </div>
            <div style={styles.output}>{h.output}</div>
          </div>
        ))}
      </div>
      <div ref={endRef} />
      <div style={styles.row}>
        <span style={styles.prompt}>{promptPath}&gt;_</span>
          {/* fake input */}
          <span style={styles.fakeInput} onClick={focusInput}>
            {/* left text */}
            {input.slice(0, cursorPos)}

            {/* current character and cursor */}
            <span style={styles.cursorBox}>
              {input[cursorPos] ?? ' ' /* &nbsp; 佔位 */}
            <span style={styles.blink} />
          </span>

          {/* right text */}
          {input.slice(cursorPos + 1) || '\u200b'}
        </span>



        {/* hide input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
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