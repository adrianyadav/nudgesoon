import type { PoolConfig } from 'pg';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
let hasShownNeonPoolerWarning = false;

function isNeonHostname(hostname: string): boolean {
  return hostname.toLowerCase().endsWith('.neon.tech');
}

function isNeonPoolerHostname(hostname: string): boolean {
  const value = hostname.toLowerCase();
  return value.includes('-pooler.') || value.includes('.pooler.');
}

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

  if (connectionString && process.env.NODE_ENV === 'production') {
    try {
      const parsedUrl = new URL(connectionString);
      if (
        isNeonHostname(parsedUrl.hostname) &&
        !isNeonPoolerHostname(parsedUrl.hostname) &&
        !hasShownNeonPoolerWarning
      ) {
        hasShownNeonPoolerWarning = true;
        console.warn(
          '[DB] Neon direct connection detected in production. Prefer Neon pooler URL on Vercel to avoid connection exhaustion.'
        );
      }
    } catch {
      // Ignore parsing errors here; ssl logic handles invalid URL fallback separately.
    }
  }

  if (shouldUseSsl(connectionString)) {
    config.ssl = {
      rejectUnauthorized: false,
    };
  }

  return config;
}
