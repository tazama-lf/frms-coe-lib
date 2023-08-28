export interface ApmConfig {
  serviceName: string;
  secretToken: string;
  serverUrl: string;
  usePathAsTransactionName: boolean;
  active: boolean;
}
