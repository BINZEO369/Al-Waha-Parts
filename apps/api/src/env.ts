export interface ApiConfig {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
  supabaseUrl: string;
  serviceRoleKey: string;
  imageKitPrivateKey: string;
  imageKitPublicKey: string;
}

export function getConfig(): ApiConfig {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.API_PORT ?? 4000),
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
      .split(',')
      .map((v) => v.trim()),
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    imageKitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? '',
    imageKitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? '',
  };
}

export function assertSupabaseConfig(config = getConfig()): ApiConfig {
  if (!config.supabaseUrl || !config.serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
  }
  return config;
}
