import { cn } from "@/lib/utils";

const statusConfig: any = {
  carregado: { label: "Carregado", color: "bg-blue-100 text-blue-600", dot: "bg-blue-600" },
  validando: { label: "Validando", color: "bg-amber-100 text-amber-600", dot: "bg-amber-600" },
  validado: { label: "Validado", color: "bg-indigo-100 text-indigo-600", dot: "bg-indigo-600" },
  processando: { label: "Processando", color: "bg-purple-100 text-purple-600", dot: "bg-purple-600" },
  processado: { label: "Concluído", color: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-600" },
  pronto_revisao: { label: "Em Revisão", color: "bg-orange-100 text-orange-600", dot: "bg-orange-600" },
  falha: { label: "Falha", color: "bg-rose-100 text-rose-600", dot: "bg-rose-600" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: "bg-slate-100 text-slate-500", dot: "bg-slate-500" };
  
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", config.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", config.dot)} />
      {config.label}
    </span>
  );
}
