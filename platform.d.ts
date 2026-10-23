// Type declarations only. Vite selects the actual runtime independently per target.
declare module '#platform' {
  export const getRuntimeSecrets: typeof import('./platform/node').getRuntimeSecrets;
  export const getDatabase: typeof import('./platform/node').getDatabase;
}
