import type { NextConfig } from 'next';
import { execSync } from 'node:child_process';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  generateBuildId: () => {
    try {
      return execSync('git rev-parse --short HEAD', {
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim();
    } catch {
      // No git history (CI temp build, fresh checkout, template verify) —
      // fall back to Next.js' default build id.
      return null;
    }
  },
  output: 'standalone',
  reactCompiler: {
    compilationMode: 'annotation',
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
