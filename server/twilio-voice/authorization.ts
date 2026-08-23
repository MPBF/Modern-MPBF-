import type { McpAuthContext } from "../mcp-types";

export function canUseTwilioVoice(auth: McpAuthContext): boolean {
  return auth.voiceAccess === true;
}

export function canBypassTwilioAllowlist(auth: McpAuthContext): boolean {
  return auth.voiceAccess === true && auth.voiceAllowlistBypass === true;
}

export function canReadTwilioCall(
  auth: McpAuthContext,
  callApiKeyId: number | null,
): boolean {
  return (
    canBypassTwilioAllowlist(auth) ||
    (callApiKeyId !== null && auth.apiKeyId === callApiKeyId)
  );
}