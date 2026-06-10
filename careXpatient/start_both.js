const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname);

function startServer(name, cwd, cmd, args) {
  console.log(`\n── Starting ${name} ──`);
  const proc = spawn(cmd, args, { cwd, shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', d => process.stdout.write(`[${name}] ${d}`));
  proc.stderr.on('data', d => process.stderr.write(`[${name}] ${d}`));
  proc.on('exit', code => console.log(`[${name}] exited with code ${code}`));
  return proc;
}

function waitForURL(url, label, timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      http.get(url, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          console.log(`\n✓ ${label} is responding (status ${res.statusCode}, ${d.length} bytes)`);
          resolve(true);
        });
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          console.log(`\n✗ ${label} failed to start within ${timeoutMs}ms`);
          reject(new Error(`Timeout: ${label}`));
        } else setTimeout(check, 2000);
      });
    }
    check();
  });
}

async function main() {
  const backend = startServer('backend', path.join(root, 'backend'), 'npm.cmd', ['run', 'dev']);
  await new Promise(r => setTimeout(r, 3000));
  const frontend = startServer('frontend', path.join(root, 'apps/web'), 'npm.cmd', ['run', 'dev']);

  console.log('\n── Waiting for servers to start ──');
  try {
    await waitForURL('http://localhost:5000', 'Backend (port 5000)', 60000);
  } catch (e) { console.log('Backend startup issue:', e.message); }

  try {
    await waitForURL('http://localhost:3000/login', 'Frontend (port 3000)', 60000);
  } catch (e) { console.log('Frontend startup issue:', e.message); }

  console.log('\n── Both servers are running ──');
  console.log('Backend: http://localhost:5000');
  console.log('Frontend: http://localhost:3000');
  console.log('\nKeeping servers alive... (press Ctrl+C to stop)\n');
}

main().catch(console.error);
