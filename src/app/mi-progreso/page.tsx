"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Leaf, Banknote, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MiProgresoPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      // Fetch Donaciones
      const { data: donsData, error: donsErr } = await supabase
        .from("donations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (donsErr) throw donsErr;

      // Fetch Acciones Verdes
      const { data: advData, error: advErr } = await supabase
        .from("advances")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (advErr) throw advErr;

      setDonations(donsData || []);
      setAdvances(advData || []);
      
    } catch (err: any) {
      setError(err.message || "Error al cargar tu información.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Aprobado</span>;
    if (status === 'rejected') return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Rechazado</span>;
    return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">En Revisión</span>;
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-12 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Mi Progreso</h1>
        <p className="text-foreground/70">Revisa el estado de tus aportaciones y acciones ecológicas.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Mis Acciones Verdes */}
        <div className="glass-panel p-6 rounded-3xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Leaf size={24} className="text-primary-500" />
            Mis Acciones Verdes
          </h2>
          
          <div className="space-y-4">
            {advances.length === 0 ? (
              <p className="text-foreground/50 text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                Aún no has reportado ninguna acción verde.
              </p>
            ) : (
              advances.map(a => (
                <div key={a.id} className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{a.description}</p>
                    {getStatusBadge(a.status)}
                  </div>
                  <p className="text-xs text-foreground/50">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mis Donaciones */}
        <div className="glass-panel p-6 rounded-3xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Banknote size={24} className="text-emerald-500" />
            Mis Donaciones
          </h2>
          
          <div className="space-y-4">
            {donations.length === 0 ? (
              <p className="text-foreground/50 text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                Aún no has registrado donaciones.
              </p>
            ) : (
              donations.map(d => (
                <div key={d.id} className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">${d.amount} MXN</p>
                    {getStatusBadge(d.status)}
                  </div>
                  <p className="text-xs text-foreground/50">{new Date(d.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
