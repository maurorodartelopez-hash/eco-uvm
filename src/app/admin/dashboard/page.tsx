"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, AlertCircle, Loader2, Banknote, Leaf, Trash2, Users, EyeOff, Eye, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"donations" | "advances" | "users">("donations");
  const [donations, setDonations] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: currentUser } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!currentUser || currentUser.role !== "admin") {
        router.push("/");
        return;
      }

      // Fetch Donaciones
      const { data: donsData, error: donsErr } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      if (donsErr) throw donsErr;

      // Fetch Avances
      const { data: advData, error: advErr } = await supabase
        .from("advances")
        .select("*")
        .order("created_at", { ascending: false });
      if (advErr) throw advErr;

      // Fetch Perfiles (Usuarios)
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (profErr) throw profErr;

      setDonations(donsData || []);
      setAdvances(advData || []);
      setProfiles(profData || []);
      
    } catch (err: any) {
      setError(err.message || "Error al cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (table: "donations" | "advances", id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq("id", id);
        
      if (error) throw error;
      
      if (table === "donations") {
        setDonations(donations.map(d => d.id === id ? { ...d, status: newStatus } : d));
      } else {
        setAdvances(advances.map(a => a.id === id ? { ...a, status: newStatus } : a));
      }
    } catch (err: any) {
      alert("Error al actualizar: " + err.message);
    }
  };

  const deleteRecord = async (table: "donations" | "advances", id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro permanentemente?")) return;
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      if (table === "donations") {
        setDonations(donations.filter(d => d.id !== id));
      } else {
        setAdvances(advances.filter(a => a.id !== id));
      }
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const updateProfile = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);
        
      if (error) throw error;
      
      setProfiles(profiles.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err: any) {
      alert("Error al actualizar usuario: " + err.message);
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
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-foreground/70">Control total sobre datos, usuarios y ranking.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Navegación por pestañas */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab("donations")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "donations" ? "bg-primary-500 text-white shadow-lg" : "bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          <Banknote size={20} /> Donaciones
        </button>
        <button 
          onClick={() => setActiveTab("advances")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "advances" ? "bg-primary-500 text-white shadow-lg" : "bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          <Leaf size={20} /> Acciones Verdes
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "users" ? "bg-primary-500 text-white shadow-lg" : "bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          <Users size={20} /> Usuarios y Ranking
        </button>
      </div>

      {/* Pestaña Donaciones */}
      {activeTab === "donations" && (
        <div className="glass-panel rounded-3xl overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20">
            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Banknote size={24} /> Donaciones Recibidas
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-foreground/60 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Donante</th>
                  <th className="px-6 py-4 font-medium">Monto</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Comprobante</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{d.donor_name}</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold">${d.amount} MXN</td>
                    <td className="px-6 py-4 text-sm text-foreground/70">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {d.comprobante_url && d.comprobante_url !== "pendiente-subida.pdf" ? (
                        <a href={d.comprobante_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline text-xs font-bold">Ver PDF/Img</a>
                      ) : (
                        <span className="text-xs text-foreground/40">Sin archivo</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        d.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {d.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus("donations", d.id, "approved")} className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100">Aprobar</button>
                          <button onClick={() => updateStatus("donations", d.id, "rejected")} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">Rechazar</button>
                        </>
                      )}
                      <button onClick={() => deleteRecord("donations", d.id)} className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors" title="Eliminar registro">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {donations.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-foreground/50">No hay donaciones registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pestaña Acciones Verdes */}
      {activeTab === "advances" && (
        <div className="glass-panel rounded-3xl overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20">
            <h2 className="text-xl font-bold flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <Leaf size={24} /> Acciones Verdes Reportadas
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-foreground/60 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium w-1/4">Autor</th>
                  <th className="px-6 py-4 font-medium w-1/2">Descripción</th>
                  <th className="px-6 py-4 font-medium">Archivo</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {advances.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{a.reporter_name}</td>
                    <td className="px-6 py-4 text-sm text-foreground/70">{a.description}</td>
                    <td className="px-6 py-4">
                      {a.evidence_url && a.evidence_url !== "pendiente-subida.jpg" ? (
                        <a href={a.evidence_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-xs font-bold">Ver Imagen</a>
                      ) : (
                        <span className="text-xs text-foreground/40">Sin archivo</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        a.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        a.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus("advances", a.id, "approved")} className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100">Aprobar</button>
                          <button onClick={() => updateStatus("advances", a.id, "rejected")} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">Rechazar</button>
                        </>
                      )}
                      <button onClick={() => deleteRecord("advances", a.id)} className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors" title="Eliminar registro">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {advances.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-foreground/50">No hay acciones verdes reportadas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pestaña Usuarios y Ranking */}
      {activeTab === "users" && (
        <div className="glass-panel rounded-3xl overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20">
            <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Users size={24} /> Gestión de Usuarios y Ranking
            </h2>
            <p className="text-sm text-foreground/60 mt-1">Controla los puntos extra y la visibilidad de los usuarios en el ranking global.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-foreground/60 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Nombre de Usuario</th>
                  <th className="px-6 py-4 font-medium">Rol</th>
                  <th className="px-6 py-4 font-medium">Puntos Manuales</th>
                  <th className="px-6 py-4 font-medium text-center">Visibilidad (Ranking)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {profiles.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${p.is_hidden ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                      {p.username || "Usuario sin nombre"}
                      {p.is_hidden && <span className="text-xs bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full">Oculto</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${p.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateProfile(p.id, { manual_points: (p.manual_points || 0) - 50 })}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                          title="Restar 50 pts"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold min-w-[30px] text-center">{p.manual_points || 0}</span>
                        <button 
                          onClick={() => updateProfile(p.id, { manual_points: (p.manual_points || 0) + 50 })}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                          title="Sumar 50 pts"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => updateProfile(p.id, { is_hidden: !p.is_hidden })}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          p.is_hidden 
                            ? 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {p.is_hidden ? <><Eye size={14} /> Mostrar en Ranking</> : <><EyeOff size={14} /> Ocultar del Ranking</>}
                      </button>
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-foreground/50">No hay usuarios registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
