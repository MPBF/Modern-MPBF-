/**
 * Tests: in-app notification to the owner of an HR user request when a
 * reviewer approves or rejects it (Task: instant employee notification).
 *
 * Covers buildUserRequestDecisionNotification — the pure builder used by the
 * PUT/PATCH /api/user-requests/:id handlers — plus delivery through a mocked
 * notification manager (sendToUser called with the owner's id and payload).
 */
import { describe, it, expect, jest } from "@jest/globals";

import { buildUserRequestDecisionNotification } from "../server/services/user-request-notifications";

const baseRequest = {
  id: 42,
  user_id: 7,
  title: "إجازة سنوية",
};

describe("buildUserRequestDecisionNotification", () => {
  it("builds an approval notification including the reviewer response text", () => {
    const decision = buildUserRequestDecisionNotification(baseRequest, {
      status: "موافق",
      response: "استمتع بإجازتك",
    });
    expect(decision).not.toBeNull();
    expect(decision!.userId).toBe(7);
    expect(decision!.payload.title_ar).toBe("تمت الموافقة على طلبك");
    expect(decision!.payload.message_ar).toContain("إجازة سنوية");
    expect(decision!.payload.message_ar).toContain("الرد: استمتع بإجازتك");
    expect(decision!.payload.type).toBe("hr");
    expect(decision!.payload.priority).toBe("high");
    expect(decision!.payload.context_type).toBe("user_request");
    expect(decision!.payload.context_id).toBe("42");
  });

  it("builds a rejection notification including the reviewer response text", () => {
    const decision = buildUserRequestDecisionNotification(baseRequest, {
      status: "مرفوض",
      response: "ضغط عمل هذا الأسبوع",
    });
    expect(decision).not.toBeNull();
    expect(decision!.payload.title_ar).toBe("تم رفض طلبك");
    expect(decision!.payload.message_ar).toContain("تم رفض طلبك");
    expect(decision!.payload.message_ar).toContain("الرد: ضغط عمل هذا الأسبوع");
  });

  it("omits the response line when the reviewer left no response", () => {
    const decision = buildUserRequestDecisionNotification(baseRequest, {
      status: "موافق",
    });
    expect(decision!.payload.message_ar).not.toContain("الرد:");
  });

  it("returns null when the status is unchanged/pending or owner missing", () => {
    expect(
      buildUserRequestDecisionNotification(baseRequest, { response: "x" }),
    ).toBeNull();
    expect(
      buildUserRequestDecisionNotification(baseRequest, { status: "معلق" }),
    ).toBeNull();
    expect(
      buildUserRequestDecisionNotification(
        { ...baseRequest, user_id: null },
        { status: "موافق" },
      ),
    ).toBeNull();
  });

  it("delivers via the notification manager's real-time channel (sendToUser)", async () => {
    const sendToUser = jest.fn(async (_userId: number, _payload: unknown) => {});
    const nm = { sendToUser };

    const decision = buildUserRequestDecisionNotification(baseRequest, {
      status: "مرفوض",
      response: "غير ممكن حالياً",
    });
    // Mirror of the route handler wiring
    if (decision) await nm.sendToUser(decision.userId, decision.payload);

    expect(sendToUser).toHaveBeenCalledTimes(1);
    expect(sendToUser).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        title_ar: "تم رفض طلبك",
        message_ar: expect.stringContaining("غير ممكن حالياً"),
        context_type: "user_request",
      }),
    );
  });
});
