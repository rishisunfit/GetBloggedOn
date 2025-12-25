"use client";

import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, Clock } from "lucide-react";
import { videoTimestampsApi, type VideoTimestamp, type CreateTimestampData } from "@/services/videoTimestamps";

interface VideoTimestampModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoId: string;
    postId?: string;
    onTimestampsChange?: () => void;
}

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Parse time string (MM:SS or HH:MM:SS) to seconds
function parseTime(timeStr: string): number {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

export function VideoTimestampModal({
    isOpen,
    onClose,
    videoId,
    postId,
    onTimestampsChange,
}: VideoTimestampModalProps) {
    const [timestamps, setTimestamps] = useState<VideoTimestamp[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTime, setEditTime] = useState("");
    const [editLabel, setEditLabel] = useState("");
    const [newTime, setNewTime] = useState("");
    const [newLabel, setNewLabel] = useState("");

    useEffect(() => {
        if (isOpen && videoId) {
            loadTimestamps();
        }
    }, [isOpen, videoId]);

    const loadTimestamps = async () => {
        if (!videoId) return;
        setLoading(true);
        try {
            const data = await videoTimestampsApi.getByVideoId(videoId);
            setTimestamps(data);
        } catch (error) {
            console.error("Error loading timestamps:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newTime.trim() || !newLabel.trim()) return;

        const seconds = parseTime(newTime.trim());
        if (isNaN(seconds) || seconds < 0) {
            alert("Please enter a valid time format (MM:SS or HH:MM:SS)");
            return;
        }

        try {
            await videoTimestampsApi.create({
                video_id: videoId,
                post_id: postId || null,
                timestamp_seconds: seconds,
                label: newLabel.trim(),
            });
            setNewTime("");
            setNewLabel("");
            await loadTimestamps();
            onTimestampsChange?.();
        } catch (error) {
            console.error("Error adding timestamp:", error);
            alert("Failed to add timestamp");
        }
    };

    const handleEdit = (timestamp: VideoTimestamp) => {
        setEditingId(timestamp.id);
        setEditTime(formatTime(timestamp.timestamp_seconds));
        setEditLabel(timestamp.label);
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editTime.trim() || !editLabel.trim()) return;

        const seconds = parseTime(editTime.trim());
        if (isNaN(seconds) || seconds < 0) {
            alert("Please enter a valid time format (MM:SS or HH:MM:SS)");
            return;
        }

        try {
            await videoTimestampsApi.update(editingId, {
                timestamp_seconds: seconds,
                label: editLabel.trim(),
            });
            setEditingId(null);
            setEditTime("");
            setEditLabel("");
            await loadTimestamps();
            onTimestampsChange?.();
        } catch (error) {
            console.error("Error updating timestamp:", error);
            alert("Failed to update timestamp");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTime("");
        setEditLabel("");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this timestamp?")) return;

        try {
            await videoTimestampsApi.delete(id);
            await loadTimestamps();
            onTimestampsChange?.();
        } catch (error) {
            console.error("Error deleting timestamp:", error);
            alert("Failed to delete timestamp");
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={20} />
                        Video Timestamps
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Add New Timestamp */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Timestamp</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Time (MM:SS or HH:MM:SS)
                                </label>
                                <input
                                    type="text"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    placeholder="1:36"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Label
                                </label>
                                <input
                                    type="text"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder="Functional Movement Screen Importance"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleAdd();
                                        }
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleAdd}
                                disabled={!newTime.trim() || !newLabel.trim()}
                                className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus size={16} />
                                Add Timestamp
                            </button>
                        </div>
                    </div>

                    {/* Timestamps List */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Timestamps ({timestamps.length})
                        </h4>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : timestamps.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No timestamps yet. Add one above to get started.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {timestamps.map((timestamp) => (
                                    <div
                                        key={timestamp.id}
                                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        {editingId === timestamp.id ? (
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editTime}
                                                        onChange={(e) => setEditTime(e.target.value)}
                                                        placeholder="1:36"
                                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editLabel}
                                                        onChange={(e) => setEditLabel(e.target.value)}
                                                        placeholder="Label"
                                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="flex-1 px-3 py-1.5 bg-black text-white rounded text-sm hover:bg-gray-800"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-mono text-gray-600">
                                                        {formatTime(timestamp.timestamp_seconds)}
                                                    </span>
                                                    <span className="text-sm text-gray-900">
                                                        {timestamp.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(timestamp)}
                                                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(timestamp.id)}
                                                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

