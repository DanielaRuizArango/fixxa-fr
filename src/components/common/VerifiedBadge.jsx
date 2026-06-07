import { ShieldCheck } from "lucide-react";

/**
 * Badge de técnico verificado.
 * variant="badge" → pill con texto "Verificado"
 * variant="icon"  → sello compacto para espacios reducidos
 */
const VerifiedBadge = ({ variant = "badge", className = "", showLabel = true }) => {
  if (variant === "icon") {
    return (
      <span
        className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-gradient-to-br from-sky-400 to-blue-600 shadow-md shadow-blue-500/25 ring-1 ring-white/20 shrink-0 ${className}`}
        title="Técnico verificado"
      >
        <ShieldCheck size={11} className="text-white" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/15 to-blue-600/15 border border-sky-400/35 text-sky-300 text-[10px] font-bold uppercase tracking-wide shrink-0 ${className}`}
      title="Técnico verificado"
    >
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gradient-to-br from-sky-400 to-blue-600">
        <ShieldCheck size={9} className="text-white" strokeWidth={2.5} />
      </span>
      {showLabel && "Verificado"}
    </span>
  );
};

export default VerifiedBadge;
