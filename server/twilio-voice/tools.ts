import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { McpAuthContext } from "../mcp-types";
import {
  canBypassTwilioAllowlist,
  canReadTwilioCall,
  canUseTwilioVoice,
} from "./authorization";
import {
  createOutboundCall,
  getCallRecord,
  getCallStatus,
  isPhoneAllowed,
  listRecentCalls,
  TwilioVoiceError,
} from "./service";
import {
  twilioCallStatusInputSchema,
  twilioMakeCallInputSchema,
  twilioRecentCallsInputSchema,
} from "./schemas";

function toolError(error: unknown) {
  const message =
    error instanceof TwilioVoiceError
      ? error.message
      : "تعذر تنفيذ عملية Twilio";
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: message }) }],
    isError: true,
  };
}

function toolResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

export function registerTwilioVoiceTools(
  server: McpServer,
  auth: McpAuthContext,
): void {
  server.tool(
    "twilio_make_call",
    "Make a secure outbound phone call using Twilio and read a short text-to-speech message.",
    twilioMakeCallInputSchema,
    async ({ to, message, language }) => {
      try {
        if (!canUseTwilioVoice(auth)) {
          throw new TwilioVoiceError(
            "ليس لديك صلاحية إجراء مكالمات Twilio",
            "TWILIO_PERMISSION_DENIED",
            403,
          );
        }
        if (
          !(await isPhoneAllowed(
            to,
            canBypassTwilioAllowlist(auth),
          ))
        ) {
          throw new TwilioVoiceError(
            "الرقم غير موجود في قائمة الأرقام المسموحة",
            "TWILIO_NUMBER_NOT_ALLOWED",
            403,
          );
        }
        return toolResult(
          await createOutboundCall({
            requestedBy: auth.userId,
            apiKeyId: auth.apiKeyId,
            to,
            message,
            language,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.tool(
    "twilio_get_call_status",
    "Get the current status and duration of a Twilio call previously created through MODERN.",
    twilioCallStatusInputSchema,
    async ({ callSid }) => {
      try {
        if (!canUseTwilioVoice(auth)) {
          throw new TwilioVoiceError(
            "ليس لديك صلاحية قراءة مكالمات Twilio",
            "TWILIO_PERMISSION_DENIED",
            403,
          );
        }
        const record = await getCallRecord(callSid);
        if (!record) {
          throw new TwilioVoiceError("المكالمة غير موجودة", "CALL_NOT_FOUND", 404);
        }
        if (!canReadTwilioCall(auth, record.mcp_api_key_id)) {
          throw new TwilioVoiceError(
            "لا يمكنك قراءة مكالمة مستخدم آخر",
            "TWILIO_CALL_FORBIDDEN",
            403,
          );
        }
        return toolResult(await getCallStatus(callSid));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.tool(
    "twilio_list_recent_calls",
    "List recent Twilio calls with status only; regular users see their own calls and managers may see all.",
    twilioRecentCallsInputSchema,
    async ({ limit }) => {
      try {
        if (!canUseTwilioVoice(auth)) {
          throw new TwilioVoiceError(
            "ليس لديك صلاحية قراءة مكالمات Twilio",
            "TWILIO_PERMISSION_DENIED",
            403,
          );
        }
        return toolResult({
          success: true,
          calls: await listRecentCalls(
            auth.apiKeyId,
            canBypassTwilioAllowlist(auth),
            limit,
          ),
        });
      } catch (error) {
        return toolError(error);
      }
    },
  );
}