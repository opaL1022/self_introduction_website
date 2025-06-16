import React from 'react';

export interface CommandResult {
  output: string | React.ReactNode;
  redirectTo?: string;  // for 'cd'
}

export function parseCommand(input: string): CommandResult {
  const [cmd, ...args] = input.trim().split(/\s+/);

  switch (cmd) {
    case 'help':
      return {
        output: (
          <div>
            <div>Available commands:</div>
            <div><span className="text-white">help</span> - Show command lists</div>
            <div><span className="text-white">cd route</span> - Switch pages (ex: <span className="text-white">cd /about</span>)</div>
          </div>
        )
      };

    case 'cd':
      if (args.length !== 1) {
        return { output: 'Usage: cd [path]' };
      }
      return { output: `Switching to ${args[0]}...`, redirectTo: args[0] };
    default:
      return { output: `Command not found: ${cmd}` };
  }
}
