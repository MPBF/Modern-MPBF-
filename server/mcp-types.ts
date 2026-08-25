export interface McpAuthContext {
  userId: number;
  apiKeyId: number;
  scopes: string[];
  permissions: string[];
  voiceAccess: boolean;
  voiceAllowlistBypass: boolean;
}