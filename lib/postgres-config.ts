import type { PoolConfig } from 'pg';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function shouldUseSsl(connectionString?: string): boolean {
  if (!connectionString) {
    return false;
  }

  try {
    const parsedUrl = new URL(connectionString);
    const sslMode = parsedUrl.searchParams.get('sslmode')?.toLowerCase();

    if (sslMode === 'disable') {
      return false;
    }

    if (sslMode) {
      return true;
    }

    return !LOCAL_HOSTS.has(parsedUrl.hostname.toLowerCase());
  } catch {
    // If URL parsing fails, keep previous behavior and attempt SSL.
    return true;
  }
}

export function getPostgresPoolConfig(connectionString?: string): PoolConfig {
  const config: PoolConfig = {
    connectionString,
  };

  if (shouldUseSsl(connectionString)) {
    config.ssl = {
      rejectUnauthorized: false,
    };
  }

  return config;
}
