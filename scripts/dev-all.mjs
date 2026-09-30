import { spawn } from 'node:child_process';

const commands = [
  ['API', 'npm', ['run', 'dev:server']],
  ['ADMIN', 'npm', ['run', 'dev:admin']],
  ['WEB', 'npm', ['run', 'dev:web']],
];

const children = commands.map(([name, cmd, args]) => {
  const child = spawn(cmd, args, { shell: true, stdio: 'inherit', env: process.env });
  child.on('exit', code => {
    if (code && !shuttingDown) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });
  return child;
});

let shuttingDown = false;
const stop = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
