/**
 * Twilio SMS utility functions
 */

/**
 * Send an SMS message via Twilio
 * @param to - Phone number to send to (e.g., "+12485685999")
 * @param body - Message body
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function sendTwilioSMS(
    to: string,
    body: string
): Promise<boolean> {
    console.log("=== ATTEMPTING TO SEND TWILIO SMS ===");
    console.log("To:", to);
    console.log("Message length:", body.length, "characters");

    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_SECRET;
    const fromNumber = process.env.TWILIO_FROM_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        console.error("❌ SMS NOT SENT - Twilio configuration missing:", {
            hasSid: !!accountSid,
            hasToken: !!authToken,
            hasFromNumber: !!fromNumber,
        });
        return false;
    }

    console.log("Twilio configuration present, proceeding with SMS send...");

    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const params = new URLSearchParams();
        params.append("To", to);
        params.append("From", fromNumber);
        params.append("Body", body);

        // Create Basic Auth header
        const credentials = Buffer.from(`${accountSid}:${authToken}`).toString(
            "base64"
        );

        console.log("Sending request to Twilio API...");
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${credentials}`,
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ SMS NOT SENT - Twilio API error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
            });
            return false;
        }

        const result = await response.json();
        console.log("✅ SMS SENT SUCCESSFULLY");
        console.log("Twilio Message SID:", result.sid);
        console.log("Status:", result.status);
        console.log("To:", result.to);
        console.log("From:", result.from);
        return true;
    } catch (error) {
        console.error("❌ SMS NOT SENT - Exception occurred:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });
        return false;
    }
}

