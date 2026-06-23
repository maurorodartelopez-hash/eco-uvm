import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-fade-in">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-medium text-sm mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Impacto Ecológico Universitario
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
        Haciendo de nuestra UVM un{" "}
        <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent italic pr-2">
          Campus Verde
        </span>
      </h1>

      <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mb-12 animate-slide-up leading-relaxed" style={{ animationDelay: "0.3s" }}>
        Únete a la iniciativa de sostenibilidad de la Universidad del Valle de México. Participa en eventos, reporta tus acciones ecológicas, compite en el ranking y contribuye a nuestro muro social.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <Link
          href="/feed"
          className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-primary-600 shadow-xl shadow-primary-500/25 transition-all hover:-translate-y-1"
        >
          Explorar el Muro Social
          <ArrowRight size={20} />
        </Link>
        <Link
          href="/acciones"
          className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-foreground px-8 py-4 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-1"
        >
          Reportar Acción Verde
        </Link>
      </div>

      {/* Feature grid */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl animate-slide-up" style={{ animationDelay: "0.5s" }}>
        <FeatureCard 
          icon={<Leaf size={32} className="text-primary-500" />}
          title="Iniciativas Ambientales"
          description="Descubre campañas de reforestación, reciclaje y cuidado del agua dentro del campus."
        />
        <FeatureCard 
          icon={<Users size={32} className="text-primary-500" />}
          title="Comunidad Activa"
          description="Comparte tus logros con otros estudiantes y profesores comprometidos con el ambiente."
        />
        <FeatureCard 
          icon={<ShieldCheck size={32} className="text-primary-500" />}
          title="Ranking Transparente"
          description="Monitoreo en tiempo real de donaciones y cumplimiento de metas para competir en el ranking."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel p-8 rounded-3xl text-left hover:-translate-y-1 transition-transform duration-300">
      <div className="bg-primary-50 dark:bg-primary-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/70 leading-relaxed">{description}</p>
    </div>
  );
}
