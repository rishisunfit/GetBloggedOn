import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Code2,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
  Minus,
  AlignVerticalJustifyCenter,
  Undo,
  Redo,
  Table,
  Subscript,
  Superscript,
  Type,
  Clock,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { useDialog } from "@/hooks/useDialog";
import { ImagePickerModal } from "./ImagePickerModal";
import { AIImageGeneratorModal } from "./AIImageGeneratorModal";
import { ImageHistoryModal } from "./ImageHistoryModal";
import {
  uploadImageToStorage,
  uploadDataURLToStorage,
} from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";

interface EditorToolbarProps {
  editor: Editor;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}

const ToolbarButton = ({
  onClick,
  active,
  children,
  title,
  disabled = false,
}: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
    } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    title={title}
    type="button"
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-gray-300 mx-0.5" />;

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLineSpacingPicker, setShowLineSpacingPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [, forceUpdate] = useState({});
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const { showDialog } = useDialog();
  const { user } = useAuth();

  // Font sizes like Google Docs
  const fontSizes = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96];

  // Listen to editor updates to refresh undo/redo button states
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      forceUpdate({});
    };

    editor.on("transaction", handleUpdate);
    editor.on("update", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  const addLink = async () => {
    const previousUrl = editor.getAttributes("link").href;

    // If there's already a link, extend to it
    if (previousUrl) {
      editor.chain().focus().extendMarkRange("link").run();
      return;
    }

    // If text is selected, show inline editor (handled by BubbleMenu)
    // Otherwise, prompt for URL
    const url = await showDialog({
      type: "prompt",
      message: "Enter URL:",
      defaultValue: "",
      title: "Add Link",
    });

    if (url === null || url === false) {
      return;
    }

    if (typeof url === "string" && url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    if (typeof url === "string") {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!user) {
      await showDialog({
        type: "alert",
        title: "Error",
        message: "You must be logged in to upload images",
      });
      return;
    }

    try {
      // Upload to Supabase storage
      const imageUrl = await uploadImageToStorage(file, user.id);
      // Insert image into editor
      editor.chain().focus().setImage({ src: imageUrl }).run();
    } catch (error) {
      console.error("Error uploading image:", error);
      await showDialog({
        type: "alert",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to upload image",
      });
    }
  };

  const handleUseGeneratedImage = async (imageUrl: string) => {
    if (!user) {
      await showDialog({
        type: "alert",
        title: "Error",
        message: "You must be logged in to use images",
      });
      return;
    }

    try {
      // Upload the generated image to Supabase storage
      const uploadedUrl = await uploadDataURLToStorage(
        imageUrl,
        user.id,
        "generated-image.png"
      );
      // Insert image into editor
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
    } catch (error) {
      console.error("Error uploading generated image:", error);
      await showDialog({
        type: "alert",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to upload image",
      });
    }
  };

  const handleSelectFromHistory = async (imageUrl: string) => {
    // Use the image directly (it's already in Supabase storage)
    editor.chain().focus().setImage({ src: imageUrl }).run();
  };

  const addImage = () => {
    setShowImagePicker(true);
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
    setShowHighlightPicker(false);
  };

  const setLineSpacing = (spacing: number) => {
    // Use TipTap's command API to apply line-height
    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        const { from, to } = state.selection;
        let hasChanges = false;

        // Get all nodes in the selection
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (
            node.type.name === "paragraph" ||
            node.type.name === "heading" ||
            node.type.name === "listItem"
          ) {
            const currentStyle = node.attrs.style || "";
            // Remove existing line-height if present
            const cleanedStyle = currentStyle
              .replace(/line-height:\s*[^;]+;?/gi, "")
              .replace(/;\s*;/g, ";") // Remove double semicolons
              .trim()
              .replace(/^;|;$/g, ""); // Remove leading/trailing semicolons

            const newStyle = cleanedStyle
              ? `${cleanedStyle}; line-height: ${spacing};`
              : `line-height: ${spacing};`;

            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              style: newStyle,
            });
            hasChanges = true;
          }
        });

        // If no selection or no changes, apply to current block
        if (!hasChanges || from === to) {
          const { $from } = state.selection;
          let node = $from.node($from.depth);
          let pos = $from.before($from.depth);

          // If we're not in a paragraph/heading/listItem, find the parent
          if (
            node.type.name !== "paragraph" &&
            node.type.name !== "heading" &&
            node.type.name !== "listItem"
          ) {
            for (let i = $from.depth; i > 0; i--) {
              const parentNode = $from.node(i);
              if (
                parentNode.type.name === "paragraph" ||
                parentNode.type.name === "heading" ||
                parentNode.type.name === "listItem"
              ) {
                node = parentNode;
                pos = $from.before(i);
                break;
              }
            }
          }

          if (
            node.type.name === "paragraph" ||
            node.type.name === "heading" ||
            node.type.name === "listItem"
          ) {
            const currentStyle = node.attrs.style || "";
            const cleanedStyle = currentStyle
              .replace(/line-height:\s*[^;]+;?/gi, "")
              .replace(/;\s*;/g, ";")
              .trim()
              .replace(/^;|;$/g, "");

            const newStyle = cleanedStyle
              ? `${cleanedStyle}; line-height: ${spacing};`
              : `line-height: ${spacing};`;

            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              style: newStyle,
            });
            hasChanges = true;
          }
        }

        return hasChanges;
      })
      .run();

    setShowLineSpacingPicker(false);
  };

  // Primary and secondary colors
  const textColors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Yellow", value: "#EAB308" },
    { name: "Green", value: "#22C55E" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Purple", value: "#A855F7" },
    { name: "Pink", value: "#EC4899" },
    { name: "Gray", value: "#6B7280" },
  ];

  const highlightColors = [
    { name: "Yellow", value: "#FEF08A" },
    { name: "Green", value: "#D1FAE5" },
    { name: "Blue", value: "#DBEAFE" },
    { name: "Pink", value: "#FCE7F3" },
    { name: "Orange", value: "#FED7AA" },
    { name: "Purple", value: "#E9D5FF" },
  ];

  return (
    <div className="border-b border-gray-200 bg-white flex-shrink-0">
      <div className="px-4">
        <div className="flex items-center justify-start gap-0 pt-1.5 pb-1.5 flex-wrap">
          {/* Headings */}
          <div className="flex items-center gap-0">
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={18} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Font Size Dropdown */}
          <div className="flex items-center gap-0  relative">
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  setShowFontSizePicker(!showFontSizePicker);
                  setShowColorPicker(false);
                  setShowHighlightPicker(false);
                  setShowLineSpacingPicker(false);
                }}
                active={showFontSizePicker}
                title="Font Size"
              >
                <Type size={18} />
              </ToolbarButton>
              {showFontSizePicker && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    {fontSizes.map((size) => (
                      <button
                        key={size}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          editor.chain().focus().setFontSize(`${size}px`).run();
                          setShowFontSizePicker(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Text Formatting */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold (Ctrl+B)"
            >
              <Bold size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic (Ctrl+I)"
            >
              <Italic size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              title="Underline (Ctrl+U)"
            >
              <Underline size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough size={18} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Lists */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              active={editor.isActive("taskList")}
              title="Task List"
            >
              <CheckSquare size={18} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Alignment */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
              <AlignLeft size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              active={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
              <AlignCenter size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
              <AlignRight size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              active={editor.isActive({ textAlign: "justify" })}
              title="Justify"
            >
              <AlignJustify size={18} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Code & Quote */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive("code")}
              title="Inline Code"
            >
              <Code size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive("codeBlock")}
              title="Code Block"
            >
              <Code2 size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Blockquote"
            >
              <Quote size={18} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Line Spacing */}
          <div className="flex items-center gap-0  relative">
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  setShowLineSpacingPicker(!showLineSpacingPicker);
                  setShowColorPicker(false);
                  setShowHighlightPicker(false);
                }}
                active={showLineSpacingPicker}
                title="Line Spacing"
              >
                <AlignVerticalJustifyCenter size={18} />
              </ToolbarButton>
              {showLineSpacingPicker && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 min-w-[120px]"
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-1">
                    {[
                      { label: "Tight", value: 1.2 },
                      { label: "Normal", value: 1.5 },
                      { label: "Relaxed", value: 1.75 },
                      { label: "Loose", value: 2.0 },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLineSpacing(option.value);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Color & Highlight */}
          <div className="flex items-center gap-0  relative">
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowHighlightPicker(false);
                }}
                active={showColorPicker}
                title="Text Color"
              >
                <div className="relative">
                  <Palette size={18} />
                  {editor.isActive("textStyle") &&
                    editor.getAttributes("textStyle").color && (
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            editor.getAttributes("textStyle").color,
                        }}
                      />
                    )}
                </div>
              </ToolbarButton>
              {showColorPicker && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl p-3 z-50"
                  style={{ minWidth: "180px" }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {textColors.map((color) => (
                      <button
                        key={color.value}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setColor(color.value);
                        }}
                        className="w-8 h-8 rounded border border-gray-300 hover:border-gray-500 hover:scale-110 transition-all cursor-pointer"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  setShowHighlightPicker(!showHighlightPicker);
                  setShowColorPicker(false);
                }}
                active={showHighlightPicker || editor.isActive("highlight")}
                title="Highlight"
              >
                <div className="relative">
                  <Highlighter size={18} />
                  {editor.isActive("highlight") &&
                    editor.getAttributes("highlight").color && (
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            editor.getAttributes("highlight").color,
                        }}
                      />
                    )}
                </div>
              </ToolbarButton>
              {showHighlightPicker && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl p-3 z-50"
                  style={{ minWidth: "140px" }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {highlightColors.map((color) => (
                      <button
                        key={color.value}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHighlight(color.value);
                        }}
                        className="w-8 h-8 rounded border border-gray-300 hover:border-gray-500 hover:scale-110 transition-all cursor-pointer"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Undo/Redo */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={18} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Subscript/Superscript */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              active={editor.isActive("subscript")}
              title="Subscript"
            >
              <Subscript size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              active={editor.isActive("superscript")}
              title="Superscript"
            >
              <Superscript size={18} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Table */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => {
                const rows = parseInt(
                  window.prompt("Number of rows:", "3") || "3"
                );
                const cols = parseInt(
                  window.prompt("Number of columns:", "3") || "3"
                );
                if (rows > 0 && cols > 0) {
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows, cols, withHeaderRow: true })
                    .run();
                }
              }}
              title="Insert Table"
            >
              <Table size={18} />
            </ToolbarButton>
            {editor.isActive("table") && (
              <>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  title="Add Column Before"
                >
                  <span className="text-xs">+Col</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title="Add Column After"
                >
                  <span className="text-xs">Col+</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  title="Delete Column"
                >
                  <span className="text-xs">-Col</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  title="Add Row Before"
                >
                  <span className="text-xs">+Row</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title="Add Row After"
                >
                  <span className="text-xs">Row+</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  title="Delete Row"
                >
                  <span className="text-xs">-Row</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  title="Delete Table"
                >
                  <span className="text-xs">Del</span>
                </ToolbarButton>
              </>
            )}
          </div>

          <Divider />

          {/* Undo/Redo */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={18} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Subscript/Superscript */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              active={editor.isActive("subscript")}
              title="Subscript"
            >
              <Subscript size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              active={editor.isActive("superscript")}
              title="Superscript"
            >
              <Superscript size={18} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Table */}
          <div className="flex items-center gap-0 ">
            <ToolbarButton
              onClick={() => {
                const rows = parseInt(
                  window.prompt("Number of rows:", "3") || "3"
                );
                const cols = parseInt(
                  window.prompt("Number of columns:", "3") || "3"
                );
                if (rows > 0 && cols > 0) {
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows, cols, withHeaderRow: true })
                    .run();
                }
              }}
              title="Insert Table"
            >
              <Table size={18} />
            </ToolbarButton>
            {editor.isActive("table") && (
              <>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  title="Add Column Before"
                >
                  <span className="text-xs">+Col</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title="Add Column After"
                >
                  <span className="text-xs">Col+</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  title="Delete Column"
                >
                  <span className="text-xs">-Col</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  title="Add Row Before"
                >
                  <span className="text-xs">+Row</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title="Add Row After"
                >
                  <span className="text-xs">Row+</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  title="Delete Row"
                >
                  <span className="text-xs">-Row</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  title="Delete Table"
                >
                  <span className="text-xs">Del</span>
                </ToolbarButton>
              </>
            )}
          </div>

          <Divider />

          {/* Media */}
          <div className="flex items-center gap-0">
            <ToolbarButton
              onClick={addLink}
              active={editor.isActive("link")}
              title="Add Link"
            >
              <Link size={18} />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Add Image">
              <Image size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setShowHistory(true)}
              title="Image History"
            >
              <Clock size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus size={18} />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelectFile={handleFileSelect}
        onGenerateWithAI={() => {
          setShowImagePicker(false);
          setShowAIGenerator(true);
        }}
      />

      {/* AI Image Generator Modal */}
      <AIImageGeneratorModal
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onUseImage={handleUseGeneratedImage}
      />

      {/* Image History Modal */}
      <ImageHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectImage={handleSelectFromHistory}
      />

      {/* Close pickers when clicking outside */}
      {(showColorPicker ||
        showHighlightPicker ||
        showLineSpacingPicker ||
        showFontSizePicker) && (
        <div
          className="fixed inset-0 z-40"
          onMouseDown={(e) => {
            // Only track if clicking on the backdrop itself (not a child)
            if (e.target === e.currentTarget) {
              dragStartRef.current = { x: e.clientX, y: e.clientY };
            }
          }}
          onMouseUp={(e) => {
            // Only close if clicking on the backdrop itself and it was a click (not a drag)
            if (e.target === e.currentTarget && dragStartRef.current) {
              const dx = Math.abs(e.clientX - dragStartRef.current.x);
              const dy = Math.abs(e.clientY - dragStartRef.current.y);
              // If moved less than 5px, it's a click, not a drag
              if (dx < 5 && dy < 5) {
                setShowColorPicker(false);
                setShowHighlightPicker(false);
                setShowLineSpacingPicker(false);
                setShowFontSizePicker(false);
              }
            }
            dragStartRef.current = null;
          }}
          onClick={(e) => {
            // Fallback: close on click if it's the backdrop
            if (e.target === e.currentTarget) {
              setShowColorPicker(false);
              setShowHighlightPicker(false);
              setShowLineSpacingPicker(false);
              setShowFontSizePicker(false);
            }
          }}
        />
      )}
    </div>
  );
}
