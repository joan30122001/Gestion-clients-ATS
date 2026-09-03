import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAccessDeniedError } from "@/features/auth/application/require-active-admin";
import { listActivePackages } from "@/features/packages/application/list-packages";
import { ClientForm } from "@/features/clients/ui/client-form";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  let packages;
  try { packages = await listActivePackages(); }
  catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    return <main className="mx-auto max-w-4xl px-4 py-10"><p role="alert">Le formulaire est momentanément indisponible. Veuillez réessayer.</p></main>;
  }
  return <main className="mx-auto max-w-7xl space-y-6 px-5 py-6 sm:px-8 lg:px-10">
    <header className="border-b border-slate-200 pb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Portefeuille</p><h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-950">Clients</h1><p className="mt-1.5 text-sm text-slate-500">Enregistrez l’identité d’un client et les conditions de son abonnement.</p></header>
    <Card className="rounded-xl border-0 shadow-[0_2px_12px_rgba(15,23,42,0.06)]"><CardHeader><CardTitle className="text-xl sm:text-2xl">Nouveau client</CardTitle><CardDescription>Les montants sont saisis en francs CFA entiers. Seuls les forfaits actifs sont proposés.</CardDescription></CardHeader><CardContent>{packages.length ? <ClientForm packages={packages} /> : <p role="status">Aucun forfait actif. Activez ou créez un forfait avant d’enregistrer un client.</p>}</CardContent></Card>
  </main>;
}
