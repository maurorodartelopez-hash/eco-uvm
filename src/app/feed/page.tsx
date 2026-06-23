"use client";

import { MessageSquare, Heart, Share2, Image as ImageIcon, BarChart2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Administrador");

  // Estados del formulario
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchPosts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data } = await supabase
        .from("profiles")
        .select("role, username")
        .eq("id", session.user.id)
        .single();
      if (data) {
        setUserRole(data.role);
        if (data.username) setUserName(data.username);
      }
    }
  };

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsErr } = await supabase
        .from("posts")
        .select(`
          *,
          poll_options (*)
        `)
        .order("created_at", { ascending: false });

      if (postsErr) throw postsErr;
      setPosts(postsData || []);
    } catch (err) {
      console.error("Error al cargar posts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (isPoll && pollOptions.some(opt => !opt.trim())) {
      setError("Todas las opciones de la encuesta deben tener texto.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = null;

      // Subir imagen si hay
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('evidencias')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('evidencias')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      // Insertar post
      const { data: newPost, error: postError } = await supabase
        .from("posts")
        .insert([{
          author_name: userName,
          content,
          image_url: imageUrl,
          is_poll: isPoll
        }])
        .select()
        .single();

      if (postError) throw postError;

      // Insertar opciones si es encuesta
      if (isPoll && newPost) {
        const optionsToInsert = pollOptions
          .filter(opt => opt.trim())
          .map(opt => ({
            post_id: newPost.id,
            option_text: opt.trim(),
            votes: 0
          }));

        const { error: optionsError } = await supabase
          .from("poll_options")
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;
      }

      // Reset y recargar
      setContent("");
      setFile(null);
      setIsPoll(false);
      setPollOptions(["", ""]);
      fetchPosts();

    } catch (err: any) {
      setError(err.message || "Error al publicar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (optionId: string, postId: string) => {
    try {
      // 1. Obtener votos actuales (una forma simple en el cliente, en prod mejor usar RPC)
      const { data: option } = await supabase
        .from("poll_options")
        .select("votes")
        .eq("id", optionId)
        .single();
        
      if (!option) return;

      // 2. Incrementar
      await supabase
        .from("poll_options")
        .update({ votes: option.votes + 1 })
        .eq("id", optionId);

      // 3. Recargar para ver los votos (o actualizar estado local)
      fetchPosts();
    } catch (err) {
      console.error("Error al votar", err);
    }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ likes: currentLikes + 1 })
        .eq("id", postId);
        
      if (!error) {
        // Actualización optimista local
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (err) {
      console.error("Error al dar like", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Muro Social</h1>
        <p className="text-foreground/70">Descubre las últimas noticias e iniciativas ecológicas de nuestra comunidad.</p>
      </div>

      {/* Creador de Posts (Solo Admin) */}
      {userRole === "admin" && (
        <div className="glass-panel p-6 rounded-3xl mb-8 animate-slide-up border-2 border-primary-100 dark:border-primary-900/30">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <MessageSquare size={20} />
            Crear Nueva Publicación
          </h2>
          
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué quieres compartir con la comunidad?"
              className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
              rows={3}
              required
            ></textarea>

            {/* Opciones de Encuesta */}
            {isPoll && (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3">
                <p className="text-sm font-bold text-foreground/80 mb-2">Opciones de la Encuesta</p>
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Opción ${idx + 1}`}
                      className="flex-1 bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                    />
                    {pollOptions.length > 2 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveOption(idx)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 5 && (
                  <button 
                    type="button" 
                    onClick={handleAddOption}
                    className="text-sm text-primary-600 font-medium hover:underline"
                  >
                    + Agregar opción
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <label className="cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground/60 hover:text-primary-500 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <ImageIcon size={20} />
                </label>
                <button 
                  type="button"
                  onClick={() => setIsPoll(!isPoll)}
                  className={`p-2 rounded-full transition-colors ${isPoll ? 'bg-primary-100 text-primary-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground/60 hover:text-primary-500'}`}
                >
                  <BarChart2 size={20} />
                </button>
                
                {file && (
                  <span className="text-xs flex items-center bg-emerald-50 text-emerald-600 px-2 rounded-lg truncate max-w-[150px]">
                    <CheckCircle2 size={12} className="mr-1" /> img adjunta
                  </span>
                )}
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="bg-primary-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-foreground/50 glass-panel rounded-3xl">
            Aún no hay publicaciones en el muro.
          </div>
        ) : (
          posts.map((post) => {
            // Calcular votos totales si es encuesta
            const totalVotes = post.is_poll 
              ? post.poll_options?.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0) || 0
              : 0;

            return (
              <div key={post.id} className="glass-panel rounded-2xl overflow-hidden animate-slide-up">
                <div className="p-6 pb-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
                      {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{post.author_name || 'Admin'}</p>
                      <p className="text-xs text-foreground/50">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground/90 mb-4 whitespace-pre-wrap">{post.content}</p>
                </div>
                
                {post.image_url && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 max-h-96 overflow-hidden flex items-center justify-center">
                    <img src={post.image_url} alt="Post content" className="w-full object-cover" />
                  </div>
                )}

                {/* Encuesta UI */}
                {post.is_poll && post.poll_options && (
                  <div className="px-6 pb-4 space-y-3">
                    {post.poll_options.sort((a: any, b: any) => a.created_at?.localeCompare(b.created_at)).map((opt: any) => {
                      const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                      
                      return (
                        <button 
                          key={opt.id}
                          onClick={() => handleVote(opt.id, post.id)}
                          className="w-full relative bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl overflow-hidden text-left transition-colors border border-slate-200 dark:border-slate-800 group"
                        >
                          <div 
                            className="absolute top-0 left-0 bottom-0 bg-primary-100 dark:bg-primary-900/30 transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <div className="relative p-3 flex justify-between items-center text-sm font-medium z-10">
                            <span>{opt.option_text}</span>
                            <span className="text-foreground/50 group-hover:text-primary-600 transition-colors">
                              {percentage}% ({opt.votes})
                            </span>
                          </div>
                        </button>
                      );
                    })}
                    <p className="text-xs text-foreground/40 text-right">{totalVotes} votos totales</p>
                  </div>
                )}
                
                <div className="px-6 py-4 flex gap-6 border-t border-slate-100 dark:border-slate-800/50">
                  <button 
                    onClick={() => handleLike(post.id, post.likes || 0)}
                    className="flex items-center gap-2 text-foreground/60 hover:text-red-500 transition-colors group"
                  >
                    <Heart size={18} className="group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
                    <span className="text-sm font-medium">{post.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-foreground/60 hover:text-blue-500 transition-colors ml-auto">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
