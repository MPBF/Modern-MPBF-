import twilio from "twilio";

export function validateTwilioWebhookSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>,
): boolean {
  if (!authToken || !signature || !url) return false;
  return twilio.validateRequest(authToken, signature, url, params);
}