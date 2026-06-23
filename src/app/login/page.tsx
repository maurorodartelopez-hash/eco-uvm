"use client";

import { Leaf, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Login exitoso, redirigir al muro social
      if (data.session) {
        router.push("/feed");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 text-white shadow-xl shadow-primary-500/30 mb-6">
            <Leaf size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Bienvenido de vuelta</h1>
          <p className="text-foreground/70">Ingresa a tu cuenta de Eco UVM</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          
            <div>
              <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@uvm.edu.mx"
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Contraseña</label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-500 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white font-bold py-3.5 rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Iniciar Sesión"}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-xs text-foreground/40">
          <p>Al ingresar, aceptas los términos de uso y políticas de privacidad de la plataforma Eco UVM.</p>
        </div>
      </div>
    </div>
  );
}
