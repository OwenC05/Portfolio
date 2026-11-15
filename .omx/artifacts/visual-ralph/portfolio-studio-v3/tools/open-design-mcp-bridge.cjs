// Session-local OpenDesign MCP client. No global configuration is changed.
// Usage: node open-design-mcp-bridge.cjs [--url http://127.0.0.1:56285]
//          [--request request.json] [--output response.json] [--timeout-ms 120000]
// Otherwise read a JSON-RPC method/params object or tool name/arguments from stdin.
// --session keeps one MCP subprocess alive; send one request JSON per line.
// End a session with {"method":"bridge/close"}. Brief drafts require this mode.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const flags = {};
  for (let i = 2; i < process.argv.length; i++) {
    const key = process.argv[i];
    if (key === '--session') { flags[key] = true; continue; }
    if (!['--url', '--request', '--output', '--timeout-ms'].includes(key) || !process.argv[i + 1]) {
      throw new Error(`Invalid option: ${key}`);
    }
    flags[key] = process.argv[++i];
  }
  const url = new URL(flags['--url'] || 'http://127.0.0.1:56285');
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(url.hostname)) {
    throw new Error('This session bridge only accepts a local HTTP daemon URL.');
  }
  if (flags['--session'] && (flags['--request'] || flags['--output'])) throw new Error('Session mode uses newline-delimited stdin/stdout, not request/output files.');
  const input = flags['--session'] ? null : JSON.parse(fs.readFileSync(flags['--request'] || 0, 'utf8'));
  const timeoutMs = Number(flags['--timeout-ms'] || 120000);
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1000 || timeoutMs > 600000) throw new Error('Timeout must be between 1000 and 600000 ms.');
  const executable = path.join(process.env.LOCALAPPDATA, 'Programs', 'Open Design', 'Open Design.exe');
  const cli = path.join(path.dirname(executable), 'resources', 'app', 'prebundled', 'daemon', 'daemon-cli.mjs');
  const child = spawn(executable, [cli, 'mcp', '--daemon-url', url.href], {
    windowsHide: true,
    shell: false,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let nextId = 1;
  let buffer = '';
  let stderr = '';
  const pending = new Map();
  child.stderr.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-4000); });
  const fail = error => {
    for (const { reject, timer } of pending.values()) { clearTimeout(timer); reject(error); }
    pending.clear();
  };
  child.on('error', fail);
  child.on('exit', code => fail(new Error(`MCP subprocess exited (${code}). ${stderr}`)));
  child.stdin.on('error', fail);
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, end).trim();
      buffer = buffer.slice(end + 1);
      if (!line) continue;
      let message;
      try { message = JSON.parse(line); } catch { continue; }
      const item = pending.get(message.id);
      if (!item) continue;
      pending.delete(message.id);
      clearTimeout(item.timer);
      if (message.error) item.reject(new Error(JSON.stringify(message.error)));
      else item.resolve(message.result);
    }
  });
  function request(requestMethod, requestParams) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`MCP ${requestMethod} timed out after ${timeoutMs} ms; no automatic retry was attempted.`));
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method: requestMethod, params: requestParams }) + '\n');
    });
  }
  function call(inputValue) {
    const method = inputValue.method || 'tools/call';
    if (!['tools/list', 'tools/call'].includes(method)) throw new Error('Only tools/list and tools/call are supported.');
    const params = inputValue.method ? (inputValue.params || {}) : { name: inputValue.name, arguments: inputValue.arguments || {} };
    return request(method, params);
  }
  try {
    await request('initialize', {
      protocolVersion: '2024-11-05', capabilities: {},
      clientInfo: { name: 'portfolio-session-bridge', version: '1.0.0' },
    });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    if (flags['--session']) {
      const reader = require('node:readline').createInterface({ input: process.stdin, terminal: false });
      process.stdout.write(JSON.stringify({ bridge: 'ready', daemonUrl: url.href }) + '\n');
      for await (const line of reader) {
        if (!line.trim()) continue;
        try {
          const next = JSON.parse(line);
          if (next.method === 'bridge/close') { reader.close(); break; }
          const result = await call(next);
          process.stdout.write(JSON.stringify({ id: next.id ?? null, result }) + '\n');
        } catch (error) {
          process.stdout.write(JSON.stringify({ error: error.message }) + '\n');
        }
      }
    } else {
      const result = await call(input);
      const output = JSON.stringify(result, null, 2) + '\n';
      if (flags['--output']) fs.writeFileSync(flags['--output'], output);
      else process.stdout.write(output);
      if (result.isError) process.exitCode = 2;
    }
  } finally {
    // Closing this client's transport lets the MCP subprocess exit normally.
    // Do not kill the daemon, desktop application, or subprocess.
    child.stdin.end();
    child.stdout.destroy();
    child.stderr.destroy();
    child.unref();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
