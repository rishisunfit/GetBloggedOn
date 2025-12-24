import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (url: string, align: "left" | "center" | "right") => void;
}

export function VideoModal({ isOpen, onClose, onInsert }: VideoModalProps) {
    const [url, setUrl] = useState("");
    const [align, setAlign] = useState<"left" | "center" | "right">("center");

    useEffect(() => {
        if (!isOpen) {
            setUrl("");
            setAlign("center");
        }
    }, [isOpen]);

    const handleInsert = () => {
        if (url.trim()) {
            onInsert(url.trim(), align);
            onClose();
        }
    };

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

                <h3 className="text-xl font-bold text-gray-900 mb-4">Insert Video</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video URL
                        </label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or direct video URL"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && url.trim()) {
                                    handleInsert();
                                }
                            }}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Supports YouTube, Vimeo, or direct video URLs
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
                        disabled={!url.trim()}
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Insert Video
                    </button>
                </div>
            </div>
        </div>
    );
}

