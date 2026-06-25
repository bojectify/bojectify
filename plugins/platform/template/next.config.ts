import type { NextConfig } from 'next';
import { execSync } from 'node:child_process';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  generateBuildId: () =>
    execSync('git rev-parse --short HEAD').toString().trim(),
  output: 'standalone',
  reactCompiler: {
    compilationMode: 'annotation',
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
