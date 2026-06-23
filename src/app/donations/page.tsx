"use client";

import { Banknote, Upload, AlertCircle, Loader2, CheckCircle, FileImage } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DonationsPage() {
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !file) {
      setError("Por favor ingresa un monto y adjunta tu comprobante.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Subir archivo a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `donaciones/${fileName}`;

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

      // 2. Insertar en base de datos
      const { error: dbError } = await supabase
        .from("donations")
        .insert([
          { 
            donor_name: donorName || "Anónimo", 
            amount: parseFloat(amount), 
            status: "pending",
            comprobante_url: publicUrl,
            user_id: userId
          }
        ]);

      if (dbError) throw dbError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al registrar la donación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Apoya la Causa</h1>
        <p className="text-foreground/70">
          Tus donaciones nos ayudan a mantener los programas de reciclaje, cuidado del agua y reforestación.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Información Bancaria */}
        <div className="glass-panel p-6 rounded-3xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-6">
            <Banknote className="text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold mb-4">Transferencia Directa</h2>
          <p className="text-sm text-foreground/70 mb-6">
            Para evitar comisiones, realizamos la recolección de fondos a través de transferencia bancaria a la cuenta institucional.
          </p>

          <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
            <div>
              <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mb-1">Banco</p>
              <p className="font-semibold">BBVA</p>
            </div>
            <div>
              <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mb-1">Titular</p>
              <p className="font-semibold">Universidad del Valle de México S.C.</p>
            </div>
            <div>
              <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mb-1">CLABE</p>
              <p className="font-mono bg-white dark:bg-black px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-sm mt-1 select-all">
                012345678901234567
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de Comprobante */}
        <div className="glass-panel p-6 rounded-3xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl font-bold mb-6">Registrar Donación</h2>
          
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">¡Gracias!</h3>
              <p className="text-foreground/70 text-sm">Tu comprobante ha sido enviado y está en espera de revisión.</p>
              <button 
                onClick={() => { setSuccess(false); setAmount(""); setDonorName(""); setFile(null); }}
                className="mt-6 text-primary-600 font-medium hover:underline text-sm"
              >
                Registrar otra
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Nombre (Opcional)</label>
                <input 
                  type="text" 
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Monto Donado ($ MXN)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ej. 500"
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Comprobante (PDF o Imagen)</label>
                <label className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer block">
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-2 text-emerald-500">
                        <FileImage size={24} />
                      </div>
                      <p className="font-medium text-emerald-600 text-sm truncate w-full">{file.name}</p>
                      <p className="text-xs text-foreground/50 mt-1">Haz clic para cambiar</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-primary-500 mb-2" size={24} />
                      <p className="text-xs text-foreground/60">Haz clic para buscar tu archivo</p>
                    </>
                  )}
                </label>
              </div>

              <button 
                type="submit"
                disabled={loading || !file || !amount}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white font-bold py-3 rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Enviar para Aprobación"}
              </button>
            </form>
          )}

          <div className="mt-4 flex items-start gap-2 text-xs text-foreground/50">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>El administrador validará la transferencia en el estado de cuenta en un lapso de 24 horas hábiles.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
