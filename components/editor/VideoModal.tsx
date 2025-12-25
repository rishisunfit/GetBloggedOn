import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (url: string, align: "left" | "center" | "right", primaryColor?: string) => void;
}

// Helper to validate Cloudflare Stream URL
function isValidCloudflareStreamUrl(url: string): boolean {
    if (!url.trim()) return false;

    // Check for Cloudflare Stream patterns
    const patterns = [
        /customer-[a-zA-Z0-9]+\.cloudflarestream\.com\/[a-zA-Z0-9]+/, // iframe or manifest URLs
        /customer-[a-zA-Z0-9]+\.cloudflarestream\.com\/[a-zA-Z0-9]+\/manifest\/video\.m3u8/, // manifest URL
        /watch\.cloudflarestream\.com\/[a-zA-Z0-9]+/,
        /^[a-zA-Z0-9]{16,}$/, // Direct video ID
    ];

    return patterns.some(pattern => pattern.test(url));
}

export function VideoModal({ isOpen, onClose, onInsert }: VideoModalProps) {
    const [url, setUrl] = useState("");
    const [align, setAlign] = useState<"left" | "center" | "right">("center");
    const [primaryColor, setPrimaryColor] = useState("#F48120"); // Default green color

    useEffect(() => {
        if (!isOpen) {
            setUrl("");
            setAlign("center");
            setPrimaryColor("#F48120");
        }
    }, [isOpen]);

    const handleInsert = () => {
        if (url.trim() && isValidCloudflareStreamUrl(url)) {
            onInsert(url.trim(), align, primaryColor);
            onClose();
        }
    };

    const isUrlValid = url.trim() && isValidCloudflareStreamUrl(url);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Insert Cloudflare Stream Video</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cloudflare Stream URL or Video ID
                        </label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://customer-CODE.cloudflarestream.com/VIDEO_UID/iframe or VIDEO_UID"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${url.trim() && !isUrlValid
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300 focus:ring-black"
                                }`}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && isUrlValid) {
                                    handleInsert();
                                }
                            }}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Enter a Cloudflare Stream URL or video ID
                        </p>
                        {url.trim() && !isUrlValid && (
                            <p className="mt-1 text-xs text-red-600">
                                Please enter a valid Cloudflare Stream URL or video ID
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Player Theme Color
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                placeholder="#F48120"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm font-mono"
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Customize the seekbar and play button color
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alignment
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setAlign("left")}
                                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${align === "left"
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                Left
                            </button>
                            <button
                                onClick={() => setAlign("center")}
                                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${align === "center"
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                Center
                            </button>
                            <button
                                onClick={() => setAlign("right")}
                                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${align === "right"
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                Right
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleInsert}
                        disabled={!isUrlValid}
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Insert Video
                    </button>
                </div>
            </div>
        </div>
    );
}

