export interface QuarantineRecord {
  id: string;
  correlation_id: string | null;
  tenant_id: string;
  endpoint_path: string;
  config_id: string | null;
  version: string | null;
  error: string;
  raw_payload: string;
  status: string;
}
