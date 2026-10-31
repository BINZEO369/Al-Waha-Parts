export const supportedEnvironments = ['development', 'staging', 'production'] as const;
export type SupportedEnvironment = (typeof supportedEnvironments)[number];
