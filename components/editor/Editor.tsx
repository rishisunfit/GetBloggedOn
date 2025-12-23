import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { ImageExtension } from "./ImageExtension";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import CodeBlock from "@tiptap/extension-code-block";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { StyleExtension, FontSizeExtension } from "./StyleExtension";
import { LinkBubbleMenu } from "./LinkBubbleMenu";
import { ImageBubbleMenu } from "./ImageBubbleMenu";

interface EditorProps {
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  onBack: () => void;
  onPreview: () => void;
  onSave: (title: string, content: string, silent?: boolean) => void;
}

export function Editor({
  initialTitle = "",
  initialContent = "",
  onBack,
  onPreview,
  onSave,
}: EditorProps) {
  const [title, setTitle] = useState(initialTitle);

  const editor = useEditor({
    immediatelyRender: false,
    onUpdate: () => {
      // Force re-render to update undo/redo button states
    },
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use the standalone CodeBlock extension
        link: false, // Disable link from StarterKit to avoid duplicate
        underline: false, // Disable underline from StarterKit to avoid duplicate
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 cursor-pointer",
        },
      }),
      ImageExtension,
      Placeholder.configure({
        placeholder: "Start writing your story...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "listItem"],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle, // Must come before Color
      Color,
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-100 rounded-lg p-4 font-mono text-sm",
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "list-none pl-0",
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Subscript,
      Superscript,
      StyleExtension,
      FontSizeExtension,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none px-4 py-8",
      },
    },
  });

  const handleSave = () => {
    const content = editor?.getHTML() || "";
    onSave(title, content);
  };

  const handlePreview = () => {
    // Auto-save content before preview (silently)
    const content = editor?.getHTML() || "";
    onSave(title, content, true);
    onPreview();
  };

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white flex-shrink-0">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back</span>
              </button>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="flex-1 text-2xl font-bold border-none outline-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400 min-w-0"
              />
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Eye size={18} />
                Preview
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium shadow-sm"
              >
                <Save size={18} />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar - No gap, directly below title bar */}
      {editor && <EditorToolbar editor={editor} />}

      {/* Link Bubble Menu */}
      {editor && <LinkBubbleMenu editor={editor} />}

      {/* Image Bubble Menu */}
      {editor && <ImageBubbleMenu editor={editor} />}

      {/* Editor Content - Infinite scrollable area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white py-12 pb-32">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
