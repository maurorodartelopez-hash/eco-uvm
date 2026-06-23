"use client";

import Link from "next/link";
import { Leaf, Menu, X, Shield, LogOut, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkUser();
      else setUserRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    
    if (session?.user?.id) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
        
      if (data) {
        setUserRole(data.role);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const publicLinks = [
    { name: "Muro Social", href: "/feed" },
    { name: "Ranking", href: "/ranking" },
    { name: "Acciones Verdes", href: "/acciones" },
    { name: "Donaciones", href: "/donations" },
  ];

  const userLinks = [
    ...publicLinks,
    { name: "Mi Progreso", href: "/mi-progreso" }
  ];

  const linksToShow = userRole === "admin" 
    ? [{ name: "Muro Social", href: "/feed" }, { name: "Ranking", href: "/ranking" }] 
    : (session ? userLinks : publicLinks);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl glass-panel rounded-2xl flex items-center justify-between px-6 py-3 transition-all">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2.5 rounded-xl text-white group-hover:shadow-lg group-hover:shadow-primary-900/20 transition-all border border-primary-400/20">
            <Leaf size={22} />
          </div>
          <span className="font-bold text-2xl tracking-tight text-primary-600 dark:text-primary-400 font-serif">
            Eco UVM
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {userRole !== "admin" && linksToShow.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-amber-600 dark:hover:text-amber-400 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-amber-500 after:transition-all hover:after:w-full"
            >
              {link.name}
            </Link>
          ))}
          
          {userRole === "admin" && (
            <>
              {linksToShow.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-foreground/70 hover:text-amber-600 dark:hover:text-amber-400 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-amber-500 after:transition-all hover:after:w-full"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/50"
              >
                <Shield size={16} />
                Admin
              </Link>
            </>
          )}

          {session ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <LogOut size={16} />
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="text-foreground/30 hover:text-primary-500 transition-colors"
              title="Acceso Restringido"
            >
              <Lock size={18} />
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground/80 hover:text-primary-500 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={cn(
          "md:hidden absolute top-20 left-4 right-4 glass-panel rounded-2xl overflow-hidden transition-all duration-300 origin-top",
          isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col p-4 gap-4">
          {userRole !== "admin" && linksToShow.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-medium px-4 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 text-foreground/80 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {userRole === "admin" && (
            <>
              {linksToShow.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium px-4 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 text-foreground/80 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-base font-bold text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 mt-2"
                onClick={() => setIsOpen(false)}
              >
                <Shield size={18} />
                Panel Admin
              </Link>
            </>
          )}
          
          <div className="h-px bg-foreground/10 my-1" />
          
          {session ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-foreground text-center px-4 py-3 rounded-xl font-medium transition-colors"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-foreground/50 text-center px-4 py-3 rounded-xl font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Lock size={18} />
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
