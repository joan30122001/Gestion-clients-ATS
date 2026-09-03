import type { Metadata } from "next";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/ui/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-blue-100/80 to-transparent" />
      <section className="relative w-full max-w-md" aria-labelledby="login-title">
        <Image src="/images/ats-logo-transparent.png" alt="ATS Gestion" width={170} height={64} className="mx-auto mb-6 h-16 w-auto object-contain" priority />
        <Card>
          <CardHeader>
            <CardTitle id="login-title">Bienvenue</CardTitle>
            <CardDescription>Connectez-vous pour accéder à votre espace de gestion.</CardDescription>
          </CardHeader>
          <CardContent><LoginForm /></CardContent>
        </Card>
      </section>
    </main>
  );
}
