import { useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useDialog } from "@/hooks/useDialog";
import { supabase } from "@/lib/supabase";

interface CTAFormProps {
  postId?: string;
}

export function CTAForm({ postId }: CTAFormProps) {
  const [formData, setFormData] = useState({
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showDialog } = useDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the current session to get the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        await showDialog({
          type: "alert",
          message: "Please log in to submit a question",
          title: "Authentication Required",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/submit-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          phone: formData.phone,
          message: formData.message,
          post_id: postId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit question");
      }

      const result = await response.json();

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ phone: "", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      await showDialog({
        type: "alert",
        message: "Failed to send message. Please try again.",
        title: "Error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-8 mt-12">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-black rounded-full">
          <MessageCircle className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Have a question? Text me
          </h3>
          <p className="text-gray-600">
            I'd love to hear from you. Drop me a message and I'll get back to you soon. <br /> -&gt; My DMs and email inbox get flooded. This is a great, private way for me to answer your questions :)
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
          <p className="text-green-800 font-semibold">
            ✓ Message sent! I'll be in touch soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+1 (555) 123-4567"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Quick Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Your message here..."
              required
              rows={4}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
