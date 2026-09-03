import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ active, className, children }: React.HTMLAttributes<HTMLSpanElement> & { active: boolean }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700", className)}>{children}</span>;
}
