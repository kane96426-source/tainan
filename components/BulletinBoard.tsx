
import React, { useState, useEffect } from 'react';
import { Post, User, BoardCategory, PostComment } from '../types';
import { ICONS, CATEGORIES } from '../constants';

interface BulletinBoardProps {
  user: User;
}

const BulletinBoard: React.FC<BulletinBoardProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState<BoardCategory | '全部'>('全部');
  const [sortBy, setSortBy] = useState<'newest' | 'likes'>('newest');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<BoardCategory>('閒聊');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nutn_board_posts');
    if (saved) setPosts(JSON.parse(saved));
  }, []);

  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    localStorage.setItem('nutn_board_posts', JSON.stringify(newPosts));
  };

  const handleCreatePost = () => {
    if (!newContent.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(),
      authorId: user.id,
      content: newContent,
      category: newCategory,
      image: imageFile || undefined,
      likes: [],
      comments: [],
      timestamp: Date.now()
    };
    savePosts([newPost, ...posts]);
    setNewContent('');
    setImageFile(null);
    setShowEditor(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePost = (postId: string) => {
    savePosts(posts.filter(p => p.id !== postId));
  };

  const toggleLike = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likes.includes(user.id);
        return {
          ...p,
          likes: hasLiked ? p.likes.filter(id => id !== user.id) : [...p.likes, user.id]
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handleAddComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    const comment: PostComment = {
      id: Date.now().toString(),
      authorId: user.id,
      content,
      timestamp: Date.now()
    };
    const updated = posts.map(p => 
      p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
    );
    savePosts(updated);
  };

  const filteredPosts = posts
    .filter(p => activeCategory === '全部' || p.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      return b.likes.length - a.likes.length;
    });

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      {/* Top Filter Bar */}
      <div className="bg-white border-b px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-10">
        <div className="flex flex-wrap gap-2">
          {['全部', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-100' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${sortBy === 'newest' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400'}`}
          >
            {ICONS.Clock} 最新
          </button>
          <button 
            onClick={() => setSortBy('likes')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${sortBy === 'likes' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400'}`}
          >
            {ICONS.Heart} 熱門
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={user.id} 
              onDelete={() => handleDeletePost(post.id)}
              onLike={() => toggleLike(post.id)}
              onAddComment={(content) => handleAddComment(post.id, content)}
            />
          ))
        ) : (
          <div className="text-center py-20 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              {ICONS.Chat}
            </div>
            <p>目前沒有任何留言，快來當第一個吧！</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {!showEditor && (
        <button 
          onClick={() => setShowEditor(true)}
          className="fixed bottom-24 right-8 w-14 h-14 bg-purple-600 text-white rounded-full shadow-xl shadow-purple-200 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-20"
        >
          {ICONS.Plus}
        </button>
      )}

      {/* Post Editor Overlay */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold">新增匿名發文</h3>
              <button onClick={() => setShowEditor(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 mb-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNewCategory(cat as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all ${
                      newCategory === cat ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <textarea
                autoFocus
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full h-40 p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-800 placeholder:text-slate-300 resize-none"
                placeholder="在這裡寫下你的想法..."
              />
              
              {imageFile && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border">
                  <img src={imageFile} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImageFile(null)}
                    className="absolute top-1 right-1 bg-black/50 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <label className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <div className="p-2 bg-slate-100 rounded-lg">📸</div>
                  <span className="text-xs font-bold">上傳圖片</span>
                </label>
                <button 
                  onClick={handleCreatePost}
                  disabled={!newContent.trim()}
                  className="px-8 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-100 hover:bg-purple-700 disabled:opacity-50 transition-all"
                >
                  發布
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PostCard: React.FC<{ 
  post: Post, 
  currentUserId: string, 
  onDelete: () => void, 
  onLike: () => void,
  onAddComment: (content: string) => void 
}> = ({ post, currentUserId, onDelete, onLike, onAddComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const hasLiked = post.likes.includes(currentUserId);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
              🕵️
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">匿名校友</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-600 font-bold">{post.category}</span>
                <span>•</span>
                <span>{new Date(post.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
          {post.authorId === currentUserId && (
            <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-colors p-1">
              {ICONS.Trash}
            </button>
          )}
        </div>
        
        <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
        
        {post.image && (
          <div className="mb-4 rounded-xl overflow-hidden border bg-slate-50">
            <img src={post.image} className="w-full max-h-[400px] object-contain" />
          </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
          <button 
            onClick={onLike}
            className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${hasLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
          >
            <div className={hasLiked ? 'fill-red-500' : ''}>{ICONS.Heart}</div>
            {post.likes.length}
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-purple-600 transition-colors"
          >
            {ICONS.Comment}
            {post.comments.length}
          </button>
        </div>
      </div>

      {showComments && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 animate-in slide-in-from-top duration-200">
          <div className="space-y-4 mb-4">
            {post.comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px]">👤</div>
                <div className="flex-1 bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400">匿名回應</span>
                    <span className="text-[9px] text-slate-300">{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onAddComment(commentText);
                  setCommentText('');
                }
              }}
              placeholder="留個言參與討論..."
              className="flex-1 bg-white px-4 py-2 rounded-full border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-purple-600 shadow-inner"
            />
            <button 
              onClick={() => {
                onAddComment(commentText);
                setCommentText('');
              }}
              className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors shadow-lg shadow-purple-100"
            >
              {ICONS.Plus}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulletinBoard;
