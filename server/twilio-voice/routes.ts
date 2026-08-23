import type { Express, Request, Response } from "express";

import {
  buildVoiceTwiml,
  getVoiceCallPayload,
  updateCallStatus,
  verifyTwilioSignature,
} from "./service";

function invalidWebhook(res: Response) {
  return res.status(403).send("Invalid Twilio webhook");
}

export function registerTwilioVoiceRoutes(app: Express): void {
  app.post("/api/twilio/voice", async (req: Request, res: Response) => {
    if (!verifyTwilioSignature(req)) return invalidWebhook(res);
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const callSid = typeof req.body?.CallSid === "string" ? req.body.CallSid : "";
    const payload = await getVoiceCallPayload(token, callSid);
    if (!payload) return invalidWebhook(res);
    res.type("text/xml").send(buildVoiceTwiml(payload.message, payload.language));
  });

  app.post("/api/twilio/status", async (req: Request, res: Response) => {
    if (!verifyTwilioSignature(req)) return invalidWebhook(res);
    const callSid = typeof req.body?.CallSid === "string" ? req.body.CallSid : "";
    const status = typeof req.body?.CallStatus === "string" ? req.body.CallStatus : "";
    if (!callSid || !status) return res.status(400).send("Invalid status payload");
    const updated = await updateCallStatus({
      callSid,
      status,
      to: typeof req.body.To === "string" ? req.body.To : undefined,
      from: typeof req.body.From === "string" ? req.body.From : undefined,
      errorCode: typeof req.body.ErrorCode === "string" ? req.body.ErrorCode : undefined,
      errorMessage:
        typeof req.body.ErrorMessage === "string"
          ? req.body.ErrorMessage
          : undefined,
    });
    if (!updated) return res.status(404).send("Call not found");
    res.status(200).send("OK");
  });
}