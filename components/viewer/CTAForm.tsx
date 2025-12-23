import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { formSubmissionsApi } from "@/services/formSubmissions";
import { useDialog } from "@/hooks/useDialog";

interface CTAFormProps {
  postId?: string;
}

export function CTAForm({ postId }: CTAFormProps) {
  const [formData, setFormData] = useState({
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const { showDialog } = useDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await formSubmissionsApi.create({
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        post_id: postId,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ phone: "", subject: "", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      await showDialog({
        type: "alert",
        message: "Failed to send message. Please try again.",
        title: "Error",
      });
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            <Send size={18} />
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
