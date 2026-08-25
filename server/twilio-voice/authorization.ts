import type { McpAuthContext } from "../mcp-types";
import { hasPermission } from "@shared/permissions";

export function canUseTwilioVoice(auth: McpAuthContext): boolean {
  return hasPermission(auth.permissions, [
    "use_twilio_voice",
    "manage_twilio_voice",
  ]);
}

export function canBypassTwilioAllowlist(auth: McpAuthContext): boolean {
  return (
    auth.voiceAllowlistBypass === true &&
    hasPermission(auth.permissions, "manage_twilio_voice")
  );
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