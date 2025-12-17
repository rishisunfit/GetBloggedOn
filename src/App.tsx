import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/editor/Editor';
import { Preview } from './components/viewer/Preview';
import { postsApi } from './api/posts';

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
};

type View = 'dashboard' | 'editor' | 'preview';

// Helper to convert DB post to UI format
const convertPost = (post: Post) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  createdAt: new Date(post.created_at),
  updatedAt: new Date(post.updated_at),
  status: post.status as 'draft' | 'published',
});

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentPost, setCurrentPost] = useState<ReturnType<typeof convertPost> | null>(null);
  const [posts, setPosts] = useState<ReturnType<typeof convertPost>[]>([]);
  const [loading, setLoading] = useState(true);

  // Load posts from Supabase on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postsApi.getAll();
      setPosts(data.map(convertPost));
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      const newPost = await postsApi.create({
        title: 'Untitled Post',
        content: '',
        status: 'draft',
      });
      setCurrentPost(convertPost(newPost));
      setCurrentView('editor');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  const handleEditPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setCurrentPost(post);
      setCurrentView('editor');
    }
  };

  const handleSavePost = async (title: string, content: string, silent = false) => {
    if (!currentPost) return;

    try {
      const updatedPost = await postsApi.update(currentPost.id, {
        title,
        content,
      });

      const converted = convertPost(updatedPost);
      setCurrentPost(converted);

      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === currentPost.id ? converted : p))
      );

      if (!silent) {
        alert('Post saved successfully!');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentPost(null);
  };

  const handlePreview = () => {
    setCurrentView('preview');
  };

  const handleBackToEditor = () => {
    setCurrentView('editor');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard 
          onCreatePost={handleCreatePost} 
          onEditPost={handleEditPost} 
          posts={posts}
          onDeletePost={async (id) => {
            if (window.confirm('Are you sure you want to delete this post?')) {
              try {
                await postsApi.delete(id);
                setPosts(posts.filter((p) => p.id !== id));
              } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post');
              }
            }
          }}
        />
      )}

      {currentView === 'editor' && currentPost && (
        <Editor
          postId={currentPost.id}
          initialTitle={currentPost.title}
          initialContent={currentPost.content}
          onBack={handleBackToDashboard}
          onPreview={handlePreview}
          onSave={handleSavePost}
        />
      )}

      {currentView === 'preview' && currentPost && (
        <Preview
          title={currentPost.title}
          content={currentPost.content}
          date={currentPost.createdAt}
          postId={currentPost.id}
          onBack={handleBackToEditor}
        />
      )}
    </>
  );
}

export default App;
