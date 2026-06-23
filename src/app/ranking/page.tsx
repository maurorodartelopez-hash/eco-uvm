"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trophy, Loader2, Medal, Target } from "lucide-react";

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      // 1. Obtener todas las acciones aprobadas
      const { data: advancesData, error: advError } = await supabase
        .from("advances")
        .select("reporter_name, user_id")
        .eq("status", "approved");

      if (advError) throw advError;

      // 2. Obtener perfiles (para puntos manuales y visibilidad)
      const { data: profilesData, error: profError } = await supabase
        .from("profiles")
        .select("id, username, manual_points, is_hidden");

      if (profError) throw profError;

      const pointsMap: Record<string, { name: string; points: number; is_hidden: boolean }> = {};

      // Inicializar con perfiles
      profilesData?.forEach(p => {
        pointsMap[p.id] = {
          name: p.username || "Usuario sin nombre",
          points: p.manual_points || 0,
          is_hidden: p.is_hidden || false
        };
      });

      // Sumar puntos de avances
      advancesData?.forEach(adv => {
        const key = adv.user_id || adv.reporter_name || 'Anónimo';
        const name = adv.reporter_name || 'Anónimo';

        if (!pointsMap[key]) {
          pointsMap[key] = { name, points: 0, is_hidden: false };
        }
        pointsMap[key].points += 50; // Cada acción vale 50 puntos
      });

      // 3. Convertir a array, filtrar ocultos y ordenar
      const sortedRanking = Object.values(pointsMap)
        .filter(user => !user.is_hidden && user.points > 0) // No mostrar ocultos ni gente con 0 o menos puntos
        .sort((a, b) => b.points - a.points)
        .slice(0, 10); // Top 10

      setRanking(sortedRanking);
    } catch (err) {
      console.error("Error al cargar ranking", err);
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

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-12 pb-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 text-amber-500 mb-6 shadow-xl shadow-amber-500/20">
          <Trophy size={40} />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Ranking de Impacto</h1>
        <p className="text-foreground/70 text-lg max-w-xl mx-auto">
          Conoce a los líderes de nuestra comunidad que más contribuyen al cuidado del medio ambiente. Cada acción cuenta.
        </p>
      </div>

      <div className="glass-panel p-2 md:p-8 rounded-3xl animate-slide-up">
        {ranking.length === 0 ? (
          <div className="text-center py-12 text-foreground/50">
            <Target className="mx-auto mb-4 opacity-50" size={48} />
            <p>Aún no hay puntos registrados. ¡Sé el primero en reportar una acción verde!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ranking.map((user, index) => {
              const isTop3 = index < 3;
              return (
                <div 
                  key={index} 
                  className={`flex items-center p-4 rounded-2xl transition-transform hover:scale-[1.02] ${
                    index === 0 ? 'bg-gradient-to-r from-amber-200/50 to-yellow-400/20 dark:from-amber-900/40 dark:to-yellow-700/20 border-2 border-amber-300 dark:border-amber-700' : 
                    index === 1 ? 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600' :
                    index === 2 ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800/50' :
                    'bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="w-12 text-center font-bold text-xl text-foreground/50 flex justify-center">
                    {index === 0 ? <Medal className="text-amber-500" size={28} /> :
                     index === 1 ? <Medal className="text-slate-400" size={28} /> :
                     index === 2 ? <Medal className="text-orange-400" size={28} /> :
                     `#${index + 1}`}
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <h3 className={`font-bold ${isTop3 ? 'text-lg' : 'text-base'}`}>
                      {user.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className={`font-black ${isTop3 ? 'text-2xl text-primary-600 dark:text-primary-400' : 'text-xl text-foreground/70'}`}>
                      {user.points} <span className="text-sm font-medium opacity-50">pts</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
