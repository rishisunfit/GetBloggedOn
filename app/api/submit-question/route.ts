import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTwilioSMS } from "@/lib/twilioUtils";
import { verifyAuthToken } from "@/lib/supabase-server";

/**
 * API endpoint for submitting questions from the preview page
 * Sends SMS notification when user submits a question via the "Have a question? Text me" form
 *
 * Request body:
 * {
 *   "phone": "+1234567890",
 *   "message": "User's question message",
 *   "post_id": "optional-post-id"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                    details: "Missing or invalid authorization token. Please log in to submit a question.",
                },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix
        const { user, error: authError } = await verifyAuthToken(token);

        if (authError || !user) {
            console.error("Authentication failed:", authError);
            return NextResponse.json(
                {
                    error: "Unauthorized",
                    details: "Invalid or expired token. Please log in again.",
                },
                { status: 401 }
            );
        }

        console.log(`Authenticated user: ${user.id} (${user.email})`);

        // Get request body
        const body = await request.json();
        const { phone, message, post_id } = body;

        if (!phone) {
            return NextResponse.json(
                { error: "phone is required" },
                { status: 400 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { error: "message is required" },
                { status: 400 }
            );
        }

        console.log("=== QUESTION SUBMISSION ===");
        console.log("Phone number:", phone);
        console.log("Message:", message);
        console.log("Post ID:", post_id || "N/A");

        // Save the submission to database (optional - continue even if this fails)
        let submissionData = null;
        let submissionError = null;
        // Keep original post_id for SMS (even if not in Supabase)
        const originalPostId = post_id || null;
        let dbPostId: string | null = null;

        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (supabaseUrl && supabaseAnonKey) {
                const supabase = createClient(supabaseUrl, supabaseAnonKey);

                // Check if post exists in Supabase (to avoid foreign key constraint error)
                if (originalPostId) {
                    const { data: postData, error: postError } = await supabase
                        .from("posts")
                        .select("id")
                        .eq("id", originalPostId)
                        .single();

                    if (postError || !postData) {
                        console.warn(`Post ID ${originalPostId} not found in Supabase posts table. Saving submission without post_id to avoid FK constraint error.`);
                        dbPostId = null; // Set to null to avoid FK constraint error
                    } else {
                        dbPostId = originalPostId; // Post exists, use it
                    }
                }

                // Insert the submission with post_id (if exists in Supabase) and user_id
                const result = await supabase
                    .from("form_submissions")
                    .insert({
                        phone: phone,
                        subject: "Question from preview page",
                        message: message,
                        post_id: dbPostId,
                        user_id: user.id,
                    })
                    .select()
                    .single();
                submissionData = result.data;
                submissionError = result.error;
            }
        } catch (error) {
            console.error("Error saving submission to database:", error);
            // Continue with SMS even if database save fails
        }

        if (submissionError) {
            console.error("Error saving submission to database:", submissionError);
            // Continue with SMS even if database save fails
        } else if (submissionData) {
            console.log("Submission saved to database:", submissionData.id);
        }

        // Get Twilio phone number from env
        const twilioToPhoneNumber = process.env.TWILIO_TO_PHONE_NUMBER;

        if (!twilioToPhoneNumber) {
            console.error("❌ SMS NOT SENT - TWILIO_TO_PHONE_NUMBER not configured");
            return NextResponse.json(
                {
                    error: "SMS configuration missing",
                    message: "TWILIO_TO_PHONE_NUMBER environment variable not set",
                },
                { status: 500 }
            );
        }

        // Format SMS message with question details
        // Use originalPostId for SMS (even if not saved to DB due to FK constraint)
        const smsMessage = `New Question from Blog Post!\n\nPhone: ${phone}\nMessage: ${message}\n${originalPostId ? `Post ID: ${originalPostId}\n` : ""}Auth ID: ${user.id}\n\nUser wants to get in touch.`;

        // Send SMS notification
        const smsSent = await sendTwilioSMS(twilioToPhoneNumber, smsMessage);

        if (!smsSent) {
            console.error("Failed to send SMS notification");
            return NextResponse.json(
                { error: "Failed to send SMS notification" },
                { status: 500 }
            );
        }

        console.log("✅ Question submission processed successfully");

        return NextResponse.json({
            success: true,
            message: "Question submitted successfully",
            data: {
                submission_id: submissionData?.id || null,
                phone: phone,
                message: message,
                post_id: originalPostId, // Return original post_id (even if not saved to DB)
            },
        });
    } catch (error) {
        console.error("Error processing question submission:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

