import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData, getStorageUrl } from "../../api";
import Swal from "sweetalert2";
import MainLayout from "../templates/MainLayout";
import { Award, X, CheckCircle, XCircle, ZoomIn, User, Calendar, Shield, Loader2 } from "lucide-react";

/* ─── helpers ────────────────────────────────────────────────── */
const TABS = [
  { key: "", label: "Todos" },
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobados" },
  { key: "rejected", label: "Rechazados" },
];

const STATUS_META = {
  pending:  { label: "Pendiente",  bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/40" },
  approved: { label: "Aprobado",   bg: "bg-green-500/20",  text: "text-green-300",  border: "border-green-500/40" },
  rejected: { label: "Rechazado",  bg: "bg-red-500/20",    text: "text-red-300",    border: "border-red-500/40" },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ─── component ──────────────────────────────────────────────── */
const CertificationReview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState("");
  const [certs, setCerts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [zoomedImg, setZoomedImg]       = useState(null);       // URL for lightbox
  const [rejectTarget, setRejectTarget] = useState(null);       // cert being rejected
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError]   = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const textareaRef = useRef(null);

  /* fetch */
  const loadCerts = async (status = "") => {
    setLoading(true);
    setError(null);
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await fetchData(`/admin/certifications${qs}`);
      // Laravel paginate() wraps items in res.data.data
      // res.data = paginator object, res.data.data = actual array
      const items = res?.data?.data ?? res?.data ?? res ?? [];
      setCerts(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar las certificaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCerts(activeTab); }, [activeTab]);

  /* focus textarea when reject modal opens */
  useEffect(() => {
    if (rejectTarget) {
      setRejectReason("");
      setRejectError("");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [rejectTarget]);

  /* approve */
  const handleApprove = async (cert) => {
    const result = await Swal.fire({
      title: "¿Aprobar certificación?",
      html: `<span style="color:#c8d2d4">Se aprobará el certificado de <b>${cert.technician?.user?.name ?? "este técnico"}</b>. Se le notificará por correo.</span>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#4C5462",
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
      background: "#1C2526",
      color: "#ffffff",
    });
    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      await fetchData(`/admin/certifications/${cert.id}/approve`, { method: "PATCH" });
      setCerts((prev) =>
        prev.map((c) =>
          c.id === cert.id ? { ...c, status: "approved", reviewed_by: "Tú" } : c
        )
      );
      Swal.fire({
        icon: "success", title: "Aprobado",
        toast: true, position: "top-end",
        showConfirmButton: false, timer: 2500, timerProgressBar: true,
        background: "#1C2526", color: "#ffffff",
      });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo aprobar.", background: "#1C2526", color: "#fff" });
    } finally {
      setActionLoading(false);
    }
  };

  /* reject */
  const submitReject = async () => {
    if (!rejectReason.trim()) { setRejectError("El motivo es obligatorio."); return; }
    setActionLoading(true);
    try {
      await fetchData(`/admin/certifications/${rejectTarget.id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejection_reason: rejectReason.trim() }),
      });
      setCerts((prev) =>
        prev.map((c) =>
          c.id === rejectTarget.id
            ? { ...c, status: "rejected", rejection_reason: rejectReason.trim(), reviewed_by: "Tú" }
            : c
        )
      );
      setRejectTarget(null);
      Swal.fire({
        icon: "success", title: "Rechazado",
        toast: true, position: "top-end",
        showConfirmButton: false, timer: 2500, timerProgressBar: true,
        background: "#1C2526", color: "#ffffff",
      });
    } catch {
      setRejectError("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  /* sidebar nav */
  const navItems = [];

  return (
    <MainLayout
      roleName="Admin"
      profileRoute="/adminProfile"
      navItems={navItems}
    >
      {/* ── header ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-[#8C7E97]/20 border border-[#8C7E97]/30">
          <Award size={28} className="text-[#8C7E97]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Certificaciones</h1>
          <p className="text-sm text-white/40 mt-0.5">Revisión y aprobación de certificados de técnicos</p>
        </div>
      </div>

      {/* ── tabs ── */}
      <div className="flex gap-1 p-1 rounded-2xl bg-[#262f31] border border-white/5 w-fit mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === t.key
                ? "bg-[#8C7E97] text-white shadow-lg"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── states ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="text-[#8C7E97] animate-spin" />
          <p className="text-white/40 text-sm">Cargando certificaciones…</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4 text-sm">
          {error}
          <button onClick={() => loadCerts(activeTab)} className="ml-3 underline text-red-200 hover:text-white">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && certs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/30">
          <Award size={48} className="opacity-30" />
          <p className="text-sm">No hay certificaciones para mostrar.</p>
        </div>
      )}

      {/* ── grid ── */}
      {!loading && !error && certs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {certs.map((cert) => {
            const meta = STATUS_META[cert.status] ?? STATUS_META.pending;
            return (
              <div
                key={cert.id}
                className="bg-[#262f31] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:border-white/10 transition-all duration-300"
              >
                {/* image */}
                <div
                  className="relative aspect-video bg-[#1a2324] cursor-zoom-in group"
                  onClick={() => setZoomedImg(getStorageUrl(cert.image_path))}
                >
                  {cert.image_path ? (
                    <img
                      src={getStorageUrl(cert.image_path)}
                      alt="Certificado"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <Award size={48} />
                    </div>
                  )}
                  {/* zoom hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn size={32} className="text-white drop-shadow" />
                  </div>
                  {/* status badge over image */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border ${meta.bg} ${meta.text} ${meta.border} backdrop-blur-sm`}>
                    {meta.label}
                  </div>
                </div>

                {/* body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* technician */}
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#8C7E97]" />
                    <span className="text-sm font-semibold text-white truncate">
                      {cert.technician?.user?.name ?? "Técnico desconocido"}
                    </span>
                  </div>

                  {/* description */}
                  {cert.description && (
                    <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{cert.description}</p>
                  )}

                  {/* meta row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40 mt-auto">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {fmt(cert.created_at)}
                    </span>
                    {cert.reviewer?.name && (
                      <span className="flex items-center gap-1">
                        <Shield size={11} /> Revisado por {cert.reviewer.name}
                      </span>
                    )}
                  </div>

                  {/* rejection reason */}
                  {cert.status === "rejected" && cert.rejection_reason && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 leading-relaxed">
                      <span className="font-bold block mb-1">Motivo de rechazo:</span>
                      {cert.rejection_reason}
                    </div>
                  )}

                  {/* actions */}
                  {cert.status === "pending" && (
                    <div className="flex gap-2 pt-1 mt-1 border-t border-white/5">
                      <button
                        onClick={() => handleApprove(cert)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition disabled:opacity-50"
                      >
                        <CheckCircle size={16} /> Aprobar
                      </button>
                      <button
                        onClick={() => setRejectTarget(cert)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition disabled:opacity-50"
                      >
                        <XCircle size={16} /> Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lightbox modal ── */}
      {zoomedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomedImg(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
            onClick={() => setZoomedImg(null)}
          >
            <X size={24} />
          </button>
          <img
            src={zoomedImg}
            alt="Certificado ampliado"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Reject modal ── */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => !actionLoading && setRejectTarget(null)}
        >
          <div
            className="bg-[#1C2526] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/20">
                  <XCircle size={22} className="text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Rechazar certificado</h2>
              </div>
              {!actionLoading && (
                <button
                  onClick={() => setRejectTarget(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <p className="text-sm text-white/50">
              Técnico: <span className="text-white font-semibold">{rejectTarget.technician?.user?.name ?? "Técnico"}</span>
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/70">
                Motivo del rechazo <span className="text-red-400">*</span>
              </label>
              <textarea
                ref={textareaRef}
                value={rejectReason}
                onChange={(e) => { setRejectReason(e.target.value); setRejectError(""); }}
                rows={4}
                placeholder="Describe por qué se rechaza este certificado…"
                className="w-full bg-[#262f31] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#8C7E97] transition"
              />
              {rejectError && (
                <p className="text-xs text-red-400">{rejectError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setRejectTarget(null)}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-semibold transition disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                onClick={submitReject}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {actionLoading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <><XCircle size={16} /> Confirmar rechazo</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CertificationReview;
