import { z } from "zod";

export const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
export const TWILIO_CALL_SID_REGEX = /^CA[a-zA-Z0-9]{10,64}$/;
export const FINAL_TWILIO_CALL_STATUSES = new Set([
  "completed",
  "busy",
  "failed",
  "no-answer",
  "canceled",
]);
export const KNOWN_TWILIO_CALL_STATUSES = new Set([
  "queued",
  "initiated",
  "ringing",
  "in-progress",
  ...FINAL_TWILIO_CALL_STATUSES,
]);

export const twilioMakeCallInputSchema = {
  to: z
    .string()
    .trim()
    .regex(E164_PHONE_REGEX, "رقم الهاتف يجب أن يكون بصيغة E.164"),
  message: z
    .string()
    .trim()
    .min(1, "الرسالة لا يمكن أن تكون فارغة")
    .max(1000, "الرسالة طويلة جداً، الحد الأقصى 1000 حرف"),
  language: z
    .enum(["ar-SA", "en-US"])
    .default("ar-SA")
    .describe("Text-to-Speech language: ar-SA or en-US"),
};

export const twilioCallStatusInputSchema = {
  callSid: z
    .string()
    .trim()
    .regex(TWILIO_CALL_SID_REGEX, "Call SID غير صالح"),
};

export const twilioRecentCallsInputSchema = {
  limit: z.number().int().min(1).max(50).default(20),
};

export function isE164PhoneNumber(value: string): boolean {
  return E164_PHONE_REGEX.test(value);
}

export function isTwilioCallSid(value: string): boolean {
  return TWILIO_CALL_SID_REGEX.test(value);
}

export function isKnownTwilioCallStatus(value: string): boolean {
  return KNOWN_TWILIO_CALL_STATUSES.has(value);
}