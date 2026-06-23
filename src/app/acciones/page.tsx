"use client";

import { UploadCloud, CheckCircle2, Loader2, FileImage } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AccionesPage() {
  const [reporterName, setReporterName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !file) {
      setError("Por favor completa la descripción y adjunta una imagen.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // 1. Subir archivo a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `acciones/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('evidencias')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('evidencias')
        .getPublicUrl(filePath);

      // Obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // 2. Insertar en la base de datos
      const { error: dbError } = await supabase
        .from("advances")
        .insert([
          { 
            reporter_name: reporterName || "Anónimo", 
            description, 
            status: "pending",
            evidence_url: publicUrl,
            user_id: userId
          }
        ]);

      if (dbError) throw dbError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Reportar Acción Verde</h1>
        <p className="text-foreground/70">
          ¿Plantaste un árbol o limpiaste un área verde? Sube tu evidencia y suma puntos para tu comunidad.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-3xl animate-slide-up">
        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Reporte Enviado!</h2>
            <p className="text-foreground/70 mb-6">Gracias por contribuir al cuidado del medio ambiente.</p>
            <button 
              onClick={() => { setSuccess(false); setDescription(""); setReporterName(""); setFile(null); }}
              className="text-primary-600 font-medium hover:underline text-sm"
            >
              Reportar otra acción
            </button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Nombre o Facultad (Opcional)</label>
              <input 
                type="text" 
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Ej. Equipo Los Lobos"
                className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción de la actividad</label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                rows={4}
                placeholder="Describe detalladamente qué acción ecológica realizaste..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Evidencia Fotográfica</label>
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group block">
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4 text-emerald-500">
                      <FileImage size={32} />
                    </div>
                    <p className="font-medium text-emerald-600">{file.name}</p>
                    <p className="text-xs text-foreground/50 mt-1">Haz clic para cambiar de imagen</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="text-primary-500" size={32} />
                    </div>
                    <p className="font-medium mb-1">Haz clic para buscar tu imagen</p>
                    <p className="text-sm text-foreground/50">PNG, JPG o WEBP (Máx. 5MB)</p>
                  </>
                )}
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading || !file || !description.trim()}
              className="w-full flex justify-center items-center gap-2 bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Enviar Reporte"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-start gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <CheckCircle2 className="shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          <strong>Aviso:</strong> Todos los reportes son revisados por el comité administrativo antes de ser aprobados y contabilizados en las métricas globales.
        </p>
      </div>
    </div>
  );
}
