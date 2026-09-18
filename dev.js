const { spawn } = require('child_process');

console.log('Starting Ugolki Server & Client...');

const server = spawn('npm', ['run', 'dev', '--workspace=server'], { stdio: 'inherit', shell: true });
const client = spawn('npm', ['run', 'dev', '--workspace=client'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit();
});
