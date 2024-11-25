import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
  };
}

export default function Landing() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          profiles:user_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-purple-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white mb-6"
        >
          Bem-vindo à sua Nova Comunidade Digital
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white mb-12 max-w-2xl mx-auto"
        >
          Um espaço acolhedor onde sua experiência é valorizada e compartilhada
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center"
        >
          <Link
            to="/register"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Registrar
          </Link>

          <Link
            to="/login"
            className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transition-colors"
          >
            Entrar
          </Link>
        </motion.div>
      </div>

      {/* Recent Posts Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white rounded-t-3xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Sabedoria Compartilhada Recentemente
        </h2>

        {loading ? (
          <div className="text-center py-8">Carregando publicações...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Ainda não há publicações. Seja o primeiro a compartilhar!
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {post.profiles?.name || 'Usuário'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
              </motion.div>
            ))}

            <div className="text-center pt-8">
              <Link
                to="/login"
                className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-purple-700 transition-colors"
              >
                Entre para ver mais
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}