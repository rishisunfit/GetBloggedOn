import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
import { NodeSelection } from "prosemirror-state";
import { useState, useEffect } from "react";

interface VideoBubbleMenuProps {
    editor: Editor;
}

export function VideoBubbleMenu({ editor }: VideoBubbleMenuProps) {
    const [isVideoSelected, setIsVideoSelected] = useState(false);

    useEffect(() => {
        if (!editor) return;

        const updateSelection = () => {
            const { selection } = editor.state;
            const selected = selection instanceof NodeSelection && selection.node.type.name === "video";
            setIsVideoSelected(selected);
        };

        // Initial check
        updateSelection();

        // Listen to selection changes
        editor.on("selectionUpdate", updateSelection);
        editor.on("transaction", updateSelection);

        return () => {
            editor.off("selectionUpdate", updateSelection);
            editor.off("transaction", updateSelection);
        };
    }, [editor]);

    if (!editor) return null;

    const handleAlign = (align: "left" | "center" | "right") => {
        const { state } = editor;
        const { selection } = state;

        const videoPos =
            selection instanceof NodeSelection && selection.node.type.name === "video"
                ? selection.from
                : null;

        if (videoPos === null) return;

        editor.commands.command(({ tr }) => {
            const node = tr.doc.nodeAt(videoPos);
            if (!node || node.type.name !== "video") return false;
            tr.setNodeMarkup(videoPos, undefined, { ...node.attrs, align });
            tr.setSelection(NodeSelection.create(tr.doc, videoPos));
            return true;
        });
        editor.commands.focus();
    };

    const handleDelete = () => {
        const { state } = editor;
        const { selection } = state;

        if (!(selection instanceof NodeSelection) || selection.node.type.name !== "video") {
            return;
        }

        const videoPos = selection.from;

        // Delete the video node from the editor
        editor.commands.command(({ tr }) => {
            tr.setSelection(NodeSelection.create(tr.doc, videoPos));
            tr.deleteSelection();
            return true;
        });
        editor.commands.focus();
    };

    // Force re-render when selection changes
    const shouldShow = ({ editor: ed }: { editor: Editor }) => {
        const { selection } = ed.state;
        const isVideo = selection instanceof NodeSelection && selection.node.type.name === "video";
        return isVideo;
    };

    return (
        <BubbleMenu
            key={isVideoSelected ? "video-selected" : "video-not-selected"}
            editor={editor}
            updateDelay={0}
            shouldShow={shouldShow}
        >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2">
                <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                    <button
                        onClick={() => handleAlign("left")}
                        className={`p-2 rounded transition-colors ${editor.getAttributes("video").align === "left"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                        title="Align left"
                    >
                        <AlignLeft size={18} />
                    </button>
                    <button
                        onClick={() => handleAlign("center")}
                        className={`p-2 rounded transition-colors ${!editor.getAttributes("video").align || editor.getAttributes("video").align === "center"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                        title="Align center"
                    >
                        <AlignCenter size={18} />
                    </button>
                    <button
                        onClick={() => handleAlign("right")}
                        className={`p-2 rounded transition-colors ${editor.getAttributes("video").align === "right"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                        title="Align right"
                    >
                        <AlignRight size={18} />
                    </button>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Delete video"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </BubbleMenu>
    );
}

