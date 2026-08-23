import crypto from "node:crypto";

import { describe, expect, it } from "@jest/globals";

import {
  isKnownTwilioCallStatus,
  twilioCallStatusInputSchema,
  twilioMakeCallInputSchema,
} from "../server/twilio-voice/schemas";
import {
  canBypassTwilioAllowlist,
  canReadTwilioCall,
  canUseTwilioVoice,
} from "../server/twilio-voice/authorization";
import { validateTwilioWebhookSignature } from "../server/twilio-voice/webhook-signature";

function twilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
): string {
  const payload = Object.keys(params)
    .sort()
    .reduce((value, key) => value + key + params[key], url);
  return crypto.createHmac("sha1", authToken).update(payload).digest("base64");
}

describe("Twilio Voice MCP validation", () => {
  it("accepts only bounded E.164 calls with a supported TTS language", () => {
    expect(
      twilioMakeCallInputSchema.to.safeParse("+966512345678").success,
    ).toBe(true);
    expect(
      twilioMakeCallInputSchema.to.safeParse("0512345678").success,
    ).toBe(false);
    expect(
      twilioMakeCallInputSchema.message.safeParse("x".repeat(1001)).success,
    ).toBe(false);
    expect(
      twilioCallStatusInputSchema.callSid.safeParse({
        callSid: "not-a-call-sid",
      }).success,
    ).toBe(false);
  });

  it("validates Twilio webhook signatures and rejects altered payloads", () => {
    const authToken = "test-auth-token";
    const url = "https://example.test/api/twilio/status";
    const params = {
      CallSid: "CA1234567890abcdef",
      CallStatus: "completed",
    };
    const signature = twilioSignature(authToken, url, params);

    expect(
      validateTwilioWebhookSignature(authToken, signature, url, params),
    ).toBe(true);
    expect(
      validateTwilioWebhookSignature(authToken, signature, url, {
        ...params,
        CallStatus: "failed",
      }),
    ).toBe(false);
  });

  it("accepts only known callback statuses", () => {
    expect(isKnownTwilioCallStatus("in-progress")).toBe(true);
    expect(isKnownTwilioCallStatus("completed")).toBe(true);
    expect(isKnownTwilioCallStatus("not-a-status")).toBe(false);
  });

  it("keeps ordinary MCP credentials allowlist-constrained and owner-scoped", () => {
    const ordinaryKey = {
      apiKeyId: 11,
      userId: 1,
      scopes: ["mcp:read"],
      voiceAccess: true,
      voiceAllowlistBypass: false,
    };
    const disabledKey = { ...ordinaryKey, apiKeyId: 12, voiceAccess: false };
    const managerKey = {
      ...ordinaryKey,
      apiKeyId: 13,
      voiceAllowlistBypass: true,
    };

    expect(canUseTwilioVoice(disabledKey)).toBe(false);
    expect(canUseTwilioVoice(ordinaryKey)).toBe(true);
    expect(canBypassTwilioAllowlist(ordinaryKey)).toBe(false);
    expect(canReadTwilioCall(ordinaryKey, 11)).toBe(true);
    expect(canReadTwilioCall(ordinaryKey, 12)).toBe(false);
    expect(canBypassTwilioAllowlist(managerKey)).toBe(true);
    expect(canReadTwilioCall(managerKey, 11)).toBe(true);
  });
});