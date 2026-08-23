export interface McpAuthContext {
  userId: number;
  apiKeyId: number;
  scopes: string[];
  voiceAccess: boolean;
  voiceAllowlistBypass: boolean;
}