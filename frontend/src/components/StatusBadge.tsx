import { cn } from "@/lib/utils";

const statusConfig: any = {
  carregado: { label: "Carregado", color: "bg-blue-500/10 text-blue-500", dot: "bg-blue-500" },
  validando: { label: "Validando", color: "bg-yellow-500/10 text-yellow-500", dot: "bg-yellow-500" },
  validado: { label: "Validado", color: "bg-indigo-500/10 text-indigo-500", dot: "bg-indigo-500" },
  processando: { label: "Processando", color: "bg-purple-500/10 text-purple-500", dot: "bg-purple-500" },
  processado: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500", dot: "bg-emerald-500" },
  pronto_revisao: { label: "Em Revisão", color: "bg-orange-500/10 text-orange-500", dot: "bg-orange-500" },
  falha: { label: "Falha", color: "bg-rose-500/10 text-rose-500", dot: "bg-rose-500" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: "bg-gray-500/10 text-gray-500", dot: "bg-gray-500" };
  
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider", config.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
