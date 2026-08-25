import { execSync } from 'child_process';
import path from 'path';

export default function globalSetup() {
  const testDbPath = path.join(__dirname, '..', 'test.db');

  execSync('npx prisma db push --skip-generate --force-reset', {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      DATABASE_URL: 'file:./test.db',
    },
    stdio: 'inherit',
  });

  return () => {
    // no-op teardown; the sqlite test db file is left on disk for inspection
    // and gets reset on the next test run via --force-reset.
    void testDbPath;
  };
}
