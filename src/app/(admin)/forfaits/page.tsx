import { redirect } from "next/navigation";
import { AdminAccessDeniedError } from "@/features/auth/application/require-active-admin";
import { listPackages } from "@/features/packages/application/list-packages";
import { PackagesList } from "@/features/packages/ui/packages-list";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  let packages;
  try { packages = await listPackages(); }
  catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    console.error("Échec technique pendant la lecture des forfaits.");
    return <main className="mx-auto max-w-6xl px-4 py-10"><p role="alert">Les forfaits sont momentanément indisponibles. Veuillez réessayer.</p></main>;
  }
  return <main className="min-h-dvh bg-slate-100"><div className="mx-auto max-w-7xl space-y-6 px-5 py-6 sm:px-8 lg:px-10">
    <header className="border-b border-slate-200 pb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Catalogue</p><h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-950">Forfaits</h1><p className="mt-1.5 text-sm text-slate-500">Créez et actualisez les offres proposées à vos clients.</p></header>
    <section aria-labelledby="packages-title"><h2 id="packages-title" className="mb-3 text-xl font-bold text-slate-950">Catalogue complet</h2><PackagesList packages={packages} /></section>
  </div></main>;
}
