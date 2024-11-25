import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navigation from '../components/Navigation';

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
  };
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Erro ao carregar publicações');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!newPost.trim()) return;

    try {
      setPublishing(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            content: newPost.trim(),
            user_id: user.id
          }
        ]);

      if (error) throw error;

      setNewPost('');
      fetchPosts(); // Refresh posts after publishing
    } catch (error) {
      console.error('Error publishing post:', error);
      setError('Erro ao publicar. Por favor, tente novamente.');
    } finally {
      setPublishing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Create Post */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Compartilhe sua Sabedoria</h2>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <textarea
              placeholder="O que você gostaria de compartilhar hoje?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || !newPost.trim()}
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {publishing ? 'Publicando...' : 'Publicar'}
            </button>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="text-center py-4">Carregando publicações...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhuma publicação ainda. Seja o primeiro a compartilhar!
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">
                      {post.profiles?.name || 'Usuário'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}