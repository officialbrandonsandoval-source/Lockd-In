// =============================================================================
// Twilio Client Initialization (Server-only)
// =============================================================================

import twilio from "twilio";

let twilioClient: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN environment variable");
  }

  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

export default getTwilioClient;
