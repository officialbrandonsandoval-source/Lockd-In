// =============================================================================
// Twilio Client Initialization (Server-only)
// =============================================================================

import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid) {
  throw new Error("Missing TWILIO_ACCOUNT_SID environment variable");
}

if (!authToken) {
  throw new Error("Missing TWILIO_AUTH_TOKEN environment variable");
}

const twilioClient = twilio(accountSid, authToken);

export default twilioClient;
