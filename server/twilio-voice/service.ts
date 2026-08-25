import crypto from "node:crypto";

import twilio from "twilio";
import type { Request } from "express";
import { and, desc, eq, isNull } from "drizzle-orm";

import {
  twilio_allowed_phone_numbers,
  twilio_voice_calls,
  type TwilioVoiceCall,
} from "@shared/schema";
import { db } from "../db";
import {
  FINAL_TWILIO_CALL_STATUSES,
  isE164PhoneNumber,
  isKnownTwilioCallStatus,
} from "./schemas";
import { validateTwilioWebhookSignature } from "./webhook-signature";

export class TwilioVoiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "TwilioVoiceError";
  }
}

interface TwilioVoiceConfig {
  accountSid: string;
  apiKeySid?: string;
  apiKeySecret?: string;
  phoneNumber: string;
  publicBaseUrl: string;
  authToken: string;
}

function readConfig(requireWebhookSecret = false): TwilioVoiceConfig {
  const values = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    apiKeySid: process.env.TWILIO_API_KEY_SID,
    apiKeySecret: process.env.TWILIO_API_KEY_SECRET,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    publicBaseUrl: process.env.PUBLIC_BASE_URL,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  };
  const required = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_PHONE_NUMBER",
    "PUBLIC_BASE_URL",
    ...(requireWebhookSecret ? ["TWILIO_AUTH_TOKEN"] : []),
  ];
  const missing = required.filter((name) => !values[name as keyof typeof values]);
  const hasApiKey =
    Boolean(values.apiKeySid) && Boolean(values.apiKeySecret);
  const hasAuthToken = Boolean(values.authToken);

  if (!hasApiKey && !hasAuthToken) {
    missing.push("TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET أو TWILIO_AUTH_TOKEN");
  }
  if (missing.length) {
    throw new TwilioVoiceError(
      `إعدادات Twilio غير مكتملة: ${missing.join(", ")}`,
      "TWILIO_NOT_CONFIGURED",
      503,
    );
  }

  const publicBaseUrl = values.publicBaseUrl!.replace(/\/+$/, "");
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(publicBaseUrl);
  } catch {
    throw new TwilioVoiceError(
      "PUBLIC_BASE_URL غير صالح",
      "TWILIO_INVALID_BASE_URL",
      503,
    );
  }
  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new TwilioVoiceError(
      "PUBLIC_BASE_URL يجب أن يستخدم HTTPS في الإنتاج",
      "TWILIO_INSECURE_BASE_URL",
      503,
    );
  }
  if (!isE164PhoneNumber(values.phoneNumber!)) {
    throw new TwilioVoiceError(
      "TWILIO_PHONE_NUMBER يجب أن يكون بصيغة E.164",
      "TWILIO_INVALID_FROM_NUMBER",
      503,
    );
  }

  return {
    accountSid: values.accountSid!,
    apiKeySid: values.apiKeySid!,
    apiKeySecret: values.apiKeySecret!,
    phoneNumber: values.phoneNumber!,
    publicBaseUrl,
    authToken: values.authToken || "",
  };
}

function twilioClient(config: TwilioVoiceConfig) {
  if (config.apiKeySid && config.apiKeySecret) {
    return twilio(config.apiKeySid, config.apiKeySecret, {
      accountSid: config.accountSid,
    });
  }

  return twilio(config.accountSid, config.authToken);
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getConfiguredAllowlist(): string[] {
  return (process.env.TWILIO_ALLOWED_NUMBERS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(isE164PhoneNumber);
}

export async function isPhoneAllowed(
  phoneNumber: string,
  canBypassAllowlist: boolean,
): Promise<boolean> {
  if (canBypassAllowlist) return true;
  const configuredNumbers = new Set(getConfiguredAllowlist());
  const dbNumbers = await db
    .select({ phoneNumber: twilio_allowed_phone_numbers.phone_number })
    .from(twilio_allowed_phone_numbers)
    .where(eq(twilio_allowed_phone_numbers.is_active, true));
  for (const row of dbNumbers) {
    configuredNumbers.add(row.phoneNumber);
  }
  return configuredNumbers.size > 0 && configuredNumbers.has(phoneNumber);
}

export async function createOutboundCall(input: {
  requestedBy: number;
  apiKeyId: number;
  to: string;
  message: string;
  language: "ar-SA" | "en-US";
}): Promise<{
  success: true;
  callSid: string;
  status: string;
  to: string;
}> {
  const config = readConfig();
  const token = crypto.randomBytes(32).toString("hex");
  const [created] = await db
    .insert(twilio_voice_calls)
    .values({
      requested_by: input.requestedBy,
      mcp_api_key_id: input.apiKeyId,
      to_number: input.to,
      from_number: config.phoneNumber,
      message: input.message,
      language: input.language,
      voice_token_hash: hashToken(token),
      status: "pending",
    })
    .returning({ id: twilio_voice_calls.id });

  try {
    const call = await twilioClient(config).calls.create({
      to: input.to,
      from: config.phoneNumber,
      url: `${config.publicBaseUrl}/api/twilio/voice?token=${encodeURIComponent(token)}`,
      method: "POST",
      statusCallback: `${config.publicBaseUrl}/api/twilio/status`,
      statusCallbackMethod: "POST",
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    });
    const status = isKnownTwilioCallStatus(call.status) ? call.status : "queued";
    await db
      .update(twilio_voice_calls)
      .set({
        call_sid: call.sid,
        status,
        updated_at: new Date(),
      })
      .where(eq(twilio_voice_calls.id, created.id));
    return {
      success: true,
      callSid: call.sid,
      status,
      to: input.to,
    };
  } catch (error: any) {
    await db
      .update(twilio_voice_calls)
      .set({
        status: "failed",
        error_code: String(error?.code || "TWILIO_REQUEST_FAILED").slice(0, 50),
        error_message: String(error?.message || "Twilio request failed").slice(
          0,
          500,
        ),
        message: null,
        updated_at: new Date(),
        completed_at: new Date(),
      })
      .where(eq(twilio_voice_calls.id, created.id))
      .catch(() => {});
    throw new TwilioVoiceError(
      "تعذر إنشاء المكالمة عبر Twilio",
      "TWILIO_CALL_CREATE_FAILED",
      502,
    );
  }
}

export async function getCallRecord(
  callSid: string,
): Promise<TwilioVoiceCall | null> {
  const [record] = await db
    .select()
    .from(twilio_voice_calls)
    .where(eq(twilio_voice_calls.call_sid, callSid))
    .limit(1);
  return record || null;
}

export async function getCallStatus(callSid: string): Promise<{
  success: true;
  callSid: string;
  status: string;
  duration: number | null;
}> {
  const config = readConfig();
  const record = await getCallRecord(callSid);
  if (!record) {
    throw new TwilioVoiceError("المكالمة غير موجودة", "CALL_NOT_FOUND", 404);
  }
  try {
    const call = await twilioClient(config).calls(callSid).fetch();
    const status = isKnownTwilioCallStatus(call.status)
      ? call.status
      : record.status;
    await updateCallStatus({ callSid, status });
    return {
      success: true,
      callSid,
      status,
      duration: call.duration ? Number(call.duration) : null,
    };
  } catch {
    throw new TwilioVoiceError(
      "تعذر جلب حالة المكالمة من Twilio",
      "TWILIO_STATUS_FETCH_FAILED",
      502,
    );
  }
}

export async function listRecentCalls(
  apiKeyId: number,
  canViewAll: boolean,
  limit: number,
) {
  const rows = await db
    .select({
      id: twilio_voice_calls.id,
      callSid: twilio_voice_calls.call_sid,
      to: twilio_voice_calls.to_number,
      from: twilio_voice_calls.from_number,
      status: twilio_voice_calls.status,
      errorCode: twilio_voice_calls.error_code,
      createdAt: twilio_voice_calls.created_at,
      updatedAt: twilio_voice_calls.updated_at,
      completedAt: twilio_voice_calls.completed_at,
    })
    .from(twilio_voice_calls)
    .where(
      canViewAll
        ? undefined
        : eq(twilio_voice_calls.mcp_api_key_id, apiKeyId),
    )
    .orderBy(desc(twilio_voice_calls.created_at))
    .limit(limit);
  return rows;
}

export async function getVoiceCallPayload(
  token: string,
  callSid: string,
): Promise<{ message: string; language: "ar-SA" | "en-US" } | null> {
  if (!token || !callSid) return null;
  // A captured valid webhook cannot make Twilio replay the spoken message:
  // serving the TwiML consumes this one-time capability atomically.
  const [record] = await db
    .update(twilio_voice_calls)
    .set({
      twiml_served_at: new Date(),
      updated_at: new Date(),
    })
    .where(
      and(
        eq(twilio_voice_calls.voice_token_hash, hashToken(token)),
        eq(twilio_voice_calls.call_sid, callSid),
        isNull(twilio_voice_calls.twiml_served_at),
      ),
    )
    .returning({
      callSid: twilio_voice_calls.call_sid,
      message: twilio_voice_calls.message,
      language: twilio_voice_calls.language,
    });
  if (
    !record ||
    record.callSid !== callSid ||
    !record.message ||
    (record.language !== "ar-SA" && record.language !== "en-US")
  ) {
    return null;
  }
  return { message: record.message, language: record.language };
}

export function buildVoiceTwiml(
  message: string,
  language: "ar-SA" | "en-US",
): string {
  const response = new twilio.twiml.VoiceResponse();
  // This Twilio SDK supports ar-AE in its SayLanguage union, not ar-SA.
  // Keep ar-SA as the user-facing choice and select the supported Arabic TTS locale.
  const twimlLanguage = language === "ar-SA" ? "ar-AE" : "en-US";
  response.say({ language: twimlLanguage }, message);
  response.hangup();
  return response.toString();
}

export function verifyTwilioSignature(req: Request): boolean {
  try {
    const config = readConfig(true);
    const signature = req.get("X-Twilio-Signature");
    if (!signature) return false;
    const url = `${config.publicBaseUrl}${req.originalUrl}`;
    return validateTwilioWebhookSignature(
      config.authToken,
      signature,
      url,
      (req.body || {}) as Record<string, string>,
    );
  } catch {
    return false;
  }
}

export async function updateCallStatus(input: {
  callSid: string;
  status: string;
  to?: string;
  from?: string;
  errorCode?: string;
  errorMessage?: string;
}): Promise<boolean> {
  if (!isKnownTwilioCallStatus(input.status)) return false;
  const record = await getCallRecord(input.callSid);
  if (!record) return false;
  if (
    FINAL_TWILIO_CALL_STATUSES.has(record.status) &&
    record.status !== input.status
  ) {
    return true;
  }
  const isFinal = FINAL_TWILIO_CALL_STATUSES.has(input.status);
  await db
    .update(twilio_voice_calls)
    .set({
      status: input.status,
      to_number: input.to || record.to_number,
      from_number: input.from || record.from_number,
      error_code: input.errorCode?.slice(0, 50) || record.error_code,
      error_message: input.errorMessage?.slice(0, 500) || record.error_message,
      message: isFinal ? null : record.message,
      completed_at: isFinal ? record.completed_at || new Date() : record.completed_at,
      updated_at: new Date(),
    })
    .where(eq(twilio_voice_calls.call_sid, input.callSid));
  return true;
}