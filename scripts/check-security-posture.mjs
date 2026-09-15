import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const hardening = fs.readFileSync(path.join(root, 'ops/systemd/tmail-app-hardening.conf'), 'utf8');

const exact = { next: '16.3.5', react: '19.3.0', 'react-dom': '19.3.0' };
for (const [name, version] of Object.entries(exact)) {
  if (pkg.dependencies?.[name] !== version) throw new Error(`${name} must remain pinned to ${version}`);
}

for (const rule of [
  'NoNewPrivileges=yes', 'PrivateTmp=yes', 'ProtectSystem=strict', 'ProtectHome=yes',
  'CapabilityBoundingSet=', 'NoExecPaths=/tmp /var/tmp /dev/shm',
  'InaccessiblePaths=/var/spool/cron /var/spool/cron/crontabs'
]) {
  if (!hardening.includes(rule)) throw new Error(`missing hardening rule: ${rule}`);
}

console.log('TMail security posture PASS');
