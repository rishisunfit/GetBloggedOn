import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import {
  ArrowLeft,
  Eye,
  Save,
  Type,
  Code2,
  Columns,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';

type EditorMode = 'wysiwyg' | 'markdown' | 'split';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EditorProps {
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  onBack: () => void;
  onPreview: () => void;
  onSave: (title: string, content: string, silent?: boolean) => void;
}

export function Editor({
  initialTitle = '',
  initialContent = '',
  onBack,
  onPreview,
  onSave,
}: EditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [editorMode, setEditorMode] = useState<EditorMode>('wysiwyg');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Start writing your story...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (editorMode === 'wysiwyg' || editorMode === 'split') {
        setMarkdownContent(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && editorMode === 'wysiwyg') {
      editor.commands.setContent(markdownContent);
    }
  }, [editorMode, editor]);

  const handleSave = () => {
    const content =
      editorMode === 'markdown' ? markdownContent : editor?.getHTML() || '';
    onSave(title, content);
  };

  const handlePreview = () => {
    // Auto-save content before preview (silently)
    const content =
      editorMode === 'markdown' ? markdownContent : editor?.getHTML() || '';
    onSave(title, content, true);
    onPreview();
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setMarkdownContent(newContent);
    if (editorMode === 'split' && editor) {
      editor.commands.setContent(newContent);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title..."
              className="text-2xl font-bold border-none outline-none focus:ring-0 w-96"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Editor Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setEditorMode('wysiwyg')}
                className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-colors ${
                  editorMode === 'wysiwyg'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-gray-200'
                }`}
                title="WYSIWYG Editor"
              >
                <Type size={16} />
                Visual
              </button>
              <button
                onClick={() => setEditorMode('markdown')}
                className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-colors ${
                  editorMode === 'markdown'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-gray-200'
                }`}
                title="Markdown Editor"
              >
                <Code2 size={16} />
                Markdown
              </button>
              <button
                onClick={() => setEditorMode('split')}
                className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-colors ${
                  editorMode === 'split' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Split View"
              >
                <Columns size={16} />
                Split
              </button>
            </div>

            {/* Advanced Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-colors ${
                showAdvanced
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle Advanced Formatting"
            >
              {showAdvanced ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              Advanced
            </button>

            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Eye size={18} />
              Preview
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {editorMode === 'wysiwyg' && (
          <div className="max-w-4xl mx-auto">
            <EditorToolbar editor={editor} showAdvanced={showAdvanced} />
            <div className="p-8">
              <EditorContent editor={editor} />
            </div>
          </div>
        )}

        {editorMode === 'markdown' && (
          <div className="max-w-4xl mx-auto p-8">
            <textarea
              value={markdownContent}
              onChange={handleMarkdownChange}
              className="w-full min-h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Write in markdown..."
            />
          </div>
        )}

        {editorMode === 'split' && (
          <div className="grid grid-cols-2 h-full">
            {/* Markdown Side */}
            <div className="border-r border-gray-300 overflow-y-auto">
              <div className="p-4 border-b border-gray-300 bg-gray-50">
                <h3 className="font-semibold">Markdown</h3>
              </div>
              <textarea
                value={markdownContent}
                onChange={handleMarkdownChange}
                className="w-full min-h-[600px] p-8 font-mono text-sm focus:outline-none resize-none"
                placeholder="Write in markdown..."
              />
            </div>

            {/* Preview Side */}
            <div className="overflow-y-auto bg-gray-50">
              <div className="p-4 border-b border-gray-300 bg-gray-50">
                <h3 className="font-semibold">Preview</h3>
              </div>
              <div className="p-8 prose prose-lg max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdownContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

