"use client";

import Link from "next/link";
import Image from "next/image";
import { BarChart3, Bell, ChevronLeft, ChevronRight, CreditCard, LogOut, Menu, Package, Users, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/features/auth/application/logout-action";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const notificationsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!notificationsOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [notificationsOpen]);
  const pathname = usePathname();
  const navigation = [
    { href: "/dashboard", label: "Tableau de bord", icon: BarChart3 },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/paiements", label: "Paiements", icon: CreditCard },
    { href: "/forfaits", label: "Forfaits", icon: Package },
  ];

  return (
    <div className="min-h-dvh bg-[#f6f8fb] lg:flex">
      {open && <button type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 z-40 border-r border-slate-200 bg-white px-5 py-6 text-slate-900 transition-all duration-200 ${collapsed ? "lg:w-[84px]" : "lg:w-[292px]"} w-[292px] ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className={`flex items-center gap-2 px-3 ${collapsed ? "lg:mx-auto" : ""}`} aria-label="ATS Gestion"><Image src="/images/ats-logo-transparent.png" alt="ATS Gestion" width={126} height={48} className={`${collapsed ? "lg:h-9" : "h-12"} h-12 w-auto object-contain`} priority /><span className={`text-[11px] font-semibold leading-4 text-slate-600 ${collapsed ? "lg:hidden" : ""}`}>Advanced<br />Technology Services</span></Link>
          <button type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white/10 lg:hidden"><X size={20} aria-hidden="true" /></button>
        </div>
        <div className={`mt-6 flex items-center ${collapsed ? "lg:justify-center" : "justify-between px-3"}`}><p className={`text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 ${collapsed ? "lg:hidden" : ""}`}>Menu principal</p><button type="button" aria-label={collapsed ? "Étendre la barre latérale" : "Réduire la barre latérale"} title={collapsed ? "Étendre la barre latérale" : "Réduire la barre latérale"} onClick={() => setCollapsed((value) => !value)} className="hidden rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 lg:block">{collapsed ? <ChevronRight size={18} aria-hidden="true" /> : <ChevronLeft size={18} aria-hidden="true" />}</button></div>
        <nav aria-label="Navigation principale" className="mt-3 space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} title={collapsed ? label : undefined} className={`flex items-center rounded-xl px-4 py-3.5 text-[15px] font-semibold transition ${collapsed ? "lg:justify-center" : "gap-4"} ${pathname === href ? "bg-blue-50 text-blue-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"}`}>
              <Icon size={18} aria-hidden="true" /> <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
            </Link>
          ))}
        </nav>
        <div className={`absolute bottom-6 left-5 right-5 border-t border-slate-200 px-3 pt-4 text-xs text-slate-400 ${collapsed ? "lg:text-center lg:text-[0px]" : ""}`}>Espace administrateur</div>
      </aside>
      <div className={`min-w-0 flex-1 transition-[margin] duration-200 ${collapsed ? "lg:ml-[84px]" : "lg:ml-[292px]"}`}>
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:min-h-[98px] sm:px-10">
          <div className="flex items-center gap-3"><button type="button" aria-label="Ouvrir le menu" onClick={() => setOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-950 lg:hidden"><Menu size={22} strokeWidth={1.8} aria-hidden="true" /></button><div><p className="text-sm text-slate-500">admin@ats.local</p><p className="font-bold text-slate-800">Administrateur</p></div></div>
          <div className="flex items-center gap-3"><div ref={notificationsRef} className="relative"><button type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)} className="relative rounded-xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm hover:bg-slate-50"><Bell size={20} aria-hidden="true" />{hasNotifications && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d7193f]" aria-label="Notification non lue" />}</button>{notificationsOpen && <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><p className="font-bold text-slate-950">Notifications</p><button type="button" onClick={() => setHasNotifications(false)} className="text-xs font-semibold text-blue-700 hover:text-blue-800">Tout marquer comme lu</button></div>{hasNotifications ? <div className="flex gap-3 border-b border-slate-100 bg-red-50/50 px-4 py-4"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d7193f]" /><div><p className="text-sm font-semibold text-slate-800">Suivi des paiements</p><p className="mt-1 text-xs leading-5 text-slate-500">Des clients ont encore un solde à régler.</p></div></div> : <p className="px-4 py-8 text-center text-sm text-slate-500">Aucune nouvelle notification.</p>}</div>}</div><form action={logoutAction}><button type="submit" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><LogOut size={18} aria-hidden="true" /> <span className="hidden sm:inline">Déconnexion</span></button></form></div>
        </header>
        {children}
      </div>
    </div>
  );
}
