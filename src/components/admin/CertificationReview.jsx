import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { fetchData, getStorageUrl } from "../../api";
import Swal from "sweetalert2";
import MainLayout from "../templates/MainLayout";
import {
  Award, X, CheckCircle, XCircle, ZoomIn, User, Calendar,
  Shield, Loader2, CreditCard, Phone, Mail, MapPin, Hash,
  FileText, Eye, Search,
} from "lucide-react";
import { buildRejectionReason, getRejectionReasonsForType } from "../../constants/rejectionReasons";

/* ─── helpers ────────────────────────────────────────────────── */
const STATUS_TABS = [
  { key: "",         label: "Todos" },
  { key: "pending",  label: "Pendientes" },
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

const itemStatus = (item) => item.approval_status ?? item.status ?? "pending";

const matchesSearch = (item, term) => {
  const q = term.trim().toLowerCase();
  if (!q) return true;

  const user = item.technician?.user ?? item.user ?? {};
  const tech = item.technician ?? {};

  return [
    user.name,
    user.email,
    user.id_number,
    user.city,
    user.phone,
    tech.title,
    tech.name,
    item.description,
    item.technician_name,
  ].some((value) => value?.toLowerCase().includes(q));
};

/* ─── component ──────────────────────────────────────────────── */
const CertificationReview = () => {
  /* view mode: "certifications" | "id_documents" */
  const [viewMode, setViewMode]           = useState("certifications");
  const [activeTab, setActiveTab]         = useState("");
  const [items, setItems]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError]                 = useState(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [hasMore, setHasMore]             = useState(false);
  const [searchTerm, setSearchTerm]       = useState("");

  /* modals */
  const [zoomedImg, setZoomedImg]         = useState(null);
  const [detailItem, setDetailItem]       = useState(null);   // item for detail modal
  const [rejectTarget, setRejectTarget]       = useState(null);
  const [rejectReasonSelect, setRejectReasonSelect] = useState("");
  const [rejectNotes, setRejectNotes]         = useState("");
  const [rejectError, setRejectError]         = useState("");
  const [actionLoading, setActionLoading]     = useState(false);
  const notesRef = useRef(null);

  /* ── fetch ── */
  const parsePageResponse = (res, page) => {
    const paginated = res?.data ?? res;
    const list = Array.isArray(paginated?.data)
      ? paginated.data
      : Array.isArray(paginated)
        ? paginated
        : [];
    const current = paginated?.current_page ?? page;
    const last = paginated?.last_page ?? current;

    return {
      list,
      currentPage: current,
      lastPage: last,
      hasMore: Boolean(paginated?.next_page_url) || (current < last && list.length > 0),
    };
  };

  const fetchPage = useCallback(async (page, mode, status) => {
    const endpoint = mode === "certifications"
      ? `/admin/certifications`
      : `/admin/id-documents`;
    const params = new URLSearchParams();
    params.append("page", String(page));
    if (status) params.append("status", status);

    const res = await fetchData(`${endpoint}?${params.toString()}`);
    return parsePageResponse(res, page);
  }, []);

  const loadPage = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const { list, currentPage: cp, hasMore: more } = await fetchPage(page, viewMode, activeTab);

      setItems((prev) => (append ? [...prev, ...list] : list));
      setHasMore(more);
      setCurrentPage(cp);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los registros.");
    } finally {
      setLoading(false);
    }
  }, [viewMode, activeTab, fetchPage]);

  const loadAllPagesForSearch = useCallback(async () => {
    try {
      setSearchLoading(true);
      setError(null);
      setItems([]);

      let combined = [];
      let pageNum = 1;

      while (pageNum <= 50) {
        const result = await fetchPage(pageNum, viewMode, activeTab);
        if (!result.list.length) break;

        combined = [...combined, ...result.list];

        if (pageNum >= result.lastPage || !result.hasMore) break;
        pageNum += 1;
      }

      setItems(combined);
      setHasMore(false);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los registros.");
    } finally {
      setSearchLoading(false);
    }
  }, [viewMode, activeTab, fetchPage]);

  const displayedItems = useMemo(
    () => items.filter((item) => matchesSearch(item, searchTerm)),
    [items, searchTerm]
  );

  const isBusy = loading || searchLoading;

  useEffect(() => {
    setItems([]);
    setHasMore(false);

    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        loadAllPagesForSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }

    loadPage(1, false);
    return undefined;
  }, [searchTerm, activeTab, viewMode, loadPage, loadAllPagesForSearch]);

  /* reset reject form when modal opens */
  useEffect(() => {
    if (rejectTarget) {
      setRejectReasonSelect("");
      setRejectNotes("");
      setRejectError("");
    }
  }, [rejectTarget]);

  /* ── approve ── */
  const handleApprove = async (item) => {
    const isCert = viewMode === "certifications";
    const result = await Swal.fire({
      title: isCert ? "¿Aprobar certificación?" : "¿Aprobar cédula?",
      html: `<span style="color:#c8d2d4">Se aprobará el documento de <b>${item.technician?.user?.name ?? "este técnico"}</b>. Se le notificará por correo.</span>`,
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

    const endpoint = isCert
      ? `/admin/certifications/${item.id}/approve`
      : `/admin/id-documents/${item.id}/approve`;

    setActionLoading(true);
    try {
      await fetchData(endpoint, { method: "PATCH" });
      setItems((prev) =>
        prev.map((c) => c.id === item.id ? { ...c, status: "approved", approval_status: "approved" } : c)
      );
      if (detailItem?.id === item.id) setDetailItem((d) => ({ ...d, status: "approved", approval_status: "approved" }));
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

  /* ── reject ── */
  const submitReject = async () => {
    if (!rejectReasonSelect) {
      setRejectError("Selecciona un motivo del listado.");
      return;
    }

    const rejectionReason = buildRejectionReason(rejectReasonSelect, rejectNotes);
    const isCert = viewMode === "certifications";
    const endpoint = isCert
      ? `/admin/certifications/${rejectTarget.id}/reject`
      : `/admin/id-documents/${rejectTarget.id}/reject`;

    setActionLoading(true);
    try {
      await fetchData(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });
      setItems((prev) =>
        prev.map((c) =>
          c.id === rejectTarget.id
            ? { ...c, status: "rejected", approval_status: "rejected", rejection_reason: rejectionReason }
            : c
        )
      );
      if (detailItem?.id === rejectTarget.id)
        setDetailItem((d) => ({ ...d, status: "rejected", approval_status: "rejected", rejection_reason: rejectionReason }));
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

  const isCertMode = viewMode === "certifications";

  return (
    <MainLayout roleName="Admin" profileRoute="/adminProfile" navItems={[]}>

      {/* ── header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-[#8C7E97]/20 border border-[#8C7E97]/30">
          <Award size={28} className="text-[#8C7E97]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Revisión de Documentos</h1>
          <p className="text-sm text-white/40 mt-0.5">Aprobación de certificados y cédulas de técnicos</p>
        </div>
      </div>

      {/* ── view mode toggle ── */}
      <div className="flex gap-3 mb-6">
        <button
          id="btn-view-certifications"
          onClick={() => { setViewMode("certifications"); setActiveTab(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
            isCertMode
              ? "bg-[#8C7E97] border-[#8C7E97] text-white shadow-lg shadow-[#8C7E97]/20"
              : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
          }`}
        >
          <Award size={16} />
          Certificaciones
        </button>
        <button
          id="btn-view-id-documents"
          onClick={() => { setViewMode("id_documents"); setActiveTab(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
            !isCertMode
              ? "bg-[#8C7E97] border-[#8C7E97] text-white shadow-lg shadow-[#8C7E97]/20"
              : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
          }`}
        >
          <CreditCard size={16} />
          Cédulas
        </button>
      </div>

      {/* ── search ── */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
        <input
          id="input-search-technician"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isCertMode
            ? "Buscar técnico por nombre, correo o cédula en certificaciones…"
            : "Buscar técnico por nombre, correo o número de cédula…"}
          className="w-full pl-12 pr-4 py-3 bg-[#262f31] border border-white/5 rounded-2xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#8C7E97] transition"
        />
      </div>

      {/* ── status tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex gap-1 p-1 rounded-2xl bg-[#262f31] border border-white/5 w-fit">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              id={`tab-status-${t.key || "all"}`}
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
        {!isBusy && !error && displayedItems.length > 0 && (
          <p className="text-xs text-white/40">
            {displayedItems.length} registro{displayedItems.length !== 1 ? "s" : ""} encontrado{displayedItems.length !== 1 ? "s" : ""}
            {searchTerm.trim() ? " · búsqueda activa" : hasMore ? " · hay más disponibles" : ""}
          </p>
        )}
      </div>

      {/* ── loading ── */}
      {isBusy && displayedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="text-[#8C7E97] animate-spin" />
          <p className="text-white/40 text-sm">
            {searchLoading
              ? (isCertMode ? "Buscando certificaciones…" : "Buscando cédulas…")
              : "Cargando registros…"}
          </p>
        </div>
      )}

      {/* ── error ── */}
      {!isBusy && error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4 text-sm">
          {error}
          <button
            onClick={() => (searchTerm.trim() ? loadAllPagesForSearch() : loadPage(1, false))}
            className="ml-3 underline text-red-200 hover:text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── empty ── */}
      {!isBusy && !error && displayedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/30">
          {isCertMode ? <Award size={48} className="opacity-30" /> : <CreditCard size={48} className="opacity-30" />}
          <p className="text-sm">
            No hay {isCertMode ? "certificaciones" : "cédulas"} para mostrar
            {searchTerm.trim() ? " con ese criterio de búsqueda." : "."}
          </p>
        </div>
      )}

      {/* ── grid ── */}
      {!error && displayedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {displayedItems.map((item) => {
            const status = itemStatus(item);
            const meta = STATUS_META[status] ?? STATUS_META.pending;
            const user = item.technician?.user ?? {};
            return (
              <div
                key={item.id}
                id={`card-doc-${item.id}`}
                className="bg-[#262f31] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:border-[#8C7E97]/30 transition-all duration-300 group cursor-pointer"
                onClick={() => setDetailItem(item)}
              >
                {/* image */}
                <div className="relative aspect-video bg-[#1a2324]">
                  {item.image_path ? (
                    <img
                      src={getStorageUrl(item.image_path)}
                      alt={isCertMode ? "Certificado" : "Cédula"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      {isCertMode ? <Award size={48} /> : <CreditCard size={48} />}
                    </div>
                  )}
                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
                      <Eye size={16} /> Ver detalle
                    </div>
                  </div>
                  {/* status badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border ${meta.bg} ${meta.text} ${meta.border} backdrop-blur-sm`}>
                    {meta.label}
                  </div>
                </div>

                {/* body */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#8C7E97] shrink-0" />
                    <span className="text-sm font-semibold text-white truncate">
                      {user.name ?? "Técnico desconocido"}
                    </span>
                  </div>

                  {/* cédula preview */}
                  {user.id_number && (
                    <div className="flex items-center gap-2">
                      <CreditCard size={13} className="text-[#8C7E97]/70 shrink-0" />
                      <span className="text-xs text-white/50 font-mono">{user.id_number}</span>
                    </div>
                  )}

                  {/* city */}
                  {user.city && (
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#8C7E97]/70 shrink-0" />
                      <span className="text-xs text-white/50">{user.city}</span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mt-1">{item.description}</p>
                  )}

                  {/* date row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/30 mt-auto pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {fmt(item.created_at)}
                    </span>
                    {item.reviewer?.name && (
                      <span className="flex items-center gap-1">
                        <Shield size={11} /> {item.reviewer.name}
                      </span>
                    )}
                  </div>

                  {/* rejection reason */}
                  {status === "rejected" && item.rejection_reason && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 leading-relaxed">
                      <span className="font-bold block mb-1">Motivo de rechazo:</span>
                      {item.rejection_reason}
                    </div>
                  )}

                  {/* quick actions */}
                  {status === "pending" && (
                    <div className="flex gap-2 pt-1 mt-1 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`btn-approve-${item.id}`}
                        onClick={() => handleApprove(item)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition disabled:opacity-50"
                      >
                        <CheckCircle size={16} /> Aprobar
                      </button>
                      <button
                        id={`btn-reject-${item.id}`}
                        onClick={() => setRejectTarget(item)}
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
          {hasMore && !searchTerm.trim() && (
            <div className="flex justify-center mt-4 w-full col-span-full">
              <button
                onClick={() => loadPage(currentPage + 1, true)}
                disabled={isBusy}
                className="px-8 py-3 bg-[#8C7E97] hover:bg-[#8C7E97]/80 text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#8C7E97]/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Cargando..." : isCertMode ? "Cargar más certificaciones" : "Cargar más cédulas"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          DETAIL MODAL
      ══════════════════════════════════════════════════════════════ */}
      {detailItem && (() => {
        const user = detailItem.technician?.user ?? {};
        const detailStatus = itemStatus(detailItem);
        const meta = STATUS_META[detailStatus] ?? STATUS_META.pending;
        return (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDetailItem(null)}
          >
            <div
              className="bg-[#1C2526] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* modal header */}
              <div className="flex items-center justify-between p-6 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#8C7E97]/20">
                    {isCertMode ? <Award size={22} className="text-[#8C7E97]" /> : <CreditCard size={22} className="text-[#8C7E97]" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {isCertMode ? "Detalle de Certificación" : "Detalle de Cédula"}
                    </h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>
                <button
                  id="btn-close-detail-modal"
                  onClick={() => setDetailItem(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* image */}
              {detailItem.image_path && (
                <div
                  className="relative bg-[#1a2324] cursor-zoom-in group"
                  style={{ maxHeight: "300px", overflow: "hidden" }}
                  onClick={() => setZoomedImg(getStorageUrl(detailItem.image_path))}
                >
                  <img
                    src={getStorageUrl(detailItem.image_path)}
                    alt="Documento"
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
                      <ZoomIn size={16} /> Ampliar imagen
                    </div>
                  </div>
                </div>
              )}

              {/* info */}
              <div className="p-6 flex flex-col gap-5">

                {/* technician info section */}
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User size={12} /> Información del Técnico
                  </h3>
                  <div className="bg-[#262f31] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* name */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#8C7E97]/15 shrink-0">
                        <User size={14} className="text-[#8C7E97]" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Nombre completo</p>
                        <p className="text-sm font-semibold text-white">{user.name ?? "—"}</p>
                      </div>
                    </div>

                    {/* cédula */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#8C7E97]/15 shrink-0">
                        <Hash size={14} className="text-[#8C7E97]" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Número de cédula</p>
                        <p className="text-sm font-semibold text-white font-mono tracking-wider">
                          {user.id_number ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* city */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#8C7E97]/15 shrink-0">
                        <MapPin size={14} className="text-[#8C7E97]" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Ciudad</p>
                        <p className="text-sm font-semibold text-white">{user.city ?? "—"}</p>
                      </div>
                    </div>

                    {/* phone */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#8C7E97]/15 shrink-0">
                        <Phone size={14} className="text-[#8C7E97]" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Teléfono</p>
                        <p className="text-sm font-semibold text-white">{user.phone ?? "—"}</p>
                      </div>
                    </div>

                    {/* email */}
                    <div className="flex items-start gap-3 sm:col-span-2">
                      <div className="p-2 rounded-xl bg-[#8C7E97]/15 shrink-0">
                        <Mail size={14} className="text-[#8C7E97]" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Correo electrónico</p>
                        <p className="text-sm font-semibold text-white">{user.email ?? "—"}</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* document info section */}
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText size={12} /> Información del Documento
                  </h3>
                  <div className="bg-[#262f31] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#8C7E97]/15 shrink-0">
                        <Calendar size={14} className="text-[#8C7E97]" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Fecha de subida</p>
                        <p className="text-sm font-semibold text-white">{fmt(detailItem.created_at)}</p>
                      </div>
                    </div>

                    {detailItem.reviewer?.name && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-[#8C7E97]/15 shrink-0">
                          <Shield size={14} className="text-[#8C7E97]" />
                        </div>
                        <div>
                          <p className="text-xs text-white/40 mb-0.5">Revisado por</p>
                          <p className="text-sm font-semibold text-white">{detailItem.reviewer.name}</p>
                        </div>
                      </div>
                    )}

                    {detailItem.description && (
                      <div className="flex items-start gap-3 sm:col-span-2">
                        <div className="p-2 rounded-xl bg-[#8C7E97]/15 shrink-0">
                          <FileText size={14} className="text-[#8C7E97]" />
                        </div>
                        <div>
                          <p className="text-xs text-white/40 mb-0.5">Descripción</p>
                          <p className="text-sm text-white/80 leading-relaxed">{detailItem.description}</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* rejection reason */}
                {detailStatus === "rejected" && detailItem.rejection_reason && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-300 leading-relaxed">
                    <span className="font-bold block mb-1">Motivo de rechazo:</span>
                    {detailItem.rejection_reason}
                  </div>
                )}

                {/* actions */}
                {detailStatus === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      id={`btn-detail-approve-${detailItem.id}`}
                      onClick={() => { handleApprove(detailItem); }}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-semibold transition disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={18} /> Aprobar</>}
                    </button>
                    <button
                      id={`btn-detail-reject-${detailItem.id}`}
                      onClick={() => { setRejectTarget(detailItem); setDetailItem(null); }}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-semibold transition disabled:opacity-50"
                    >
                      <XCircle size={18} /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════════════════════════ */}
      {zoomedImg && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomedImg(null)}
        >
          <button
            id="btn-close-lightbox"
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
            onClick={() => setZoomedImg(null)}
          >
            <X size={24} />
          </button>
          <img
            src={zoomedImg}
            alt="Documento ampliado"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          REJECT MODAL
      ══════════════════════════════════════════════════════════════ */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => !actionLoading && setRejectTarget(null)}
        >
          <div
            className="bg-[#1C2526] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/20">
                  <XCircle size={22} className="text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  {isCertMode ? "Rechazar certificado" : "Rechazar cédula"}
                </h2>
              </div>
              {!actionLoading && (
                <button
                  id="btn-close-reject-modal"
                  onClick={() => setRejectTarget(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* technician info summary */}
            <div className="bg-[#262f31] rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#8C7E97]" />
                <span className="text-sm font-semibold text-white">
                  {rejectTarget.technician?.user?.name ?? "Técnico"}
                </span>
              </div>
              {rejectTarget.technician?.user?.id_number && (
                <div className="flex items-center gap-2">
                  <Hash size={13} className="text-[#8C7E97]/70" />
                  <span className="text-xs text-white/50 font-mono">
                    {rejectTarget.technician.user.id_number}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/70">
                  Motivo del rechazo <span className="text-red-400">*</span>
                </label>
                <select
                  id="select-reject-reason"
                  value={rejectReasonSelect}
                  onChange={(e) => { setRejectReasonSelect(e.target.value); setRejectError(""); }}
                  className="w-full bg-[#262f31] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8C7E97] transition"
                >
                  <option value="">Selecciona un motivo…</option>
                  {getRejectionReasonsForType(viewMode === "certifications" ? "certification" : "id_document").map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/70">
                  Notas adicionales <span className="text-white/30 font-normal">(opcional)</span>
                </label>
                <textarea
                  id="textarea-reject-notes"
                  ref={notesRef}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  rows={3}
                  placeholder="Añade detalles extra para el técnico…"
                  className="w-full bg-[#262f31] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#8C7E97] transition"
                />
              </div>

              {rejectError && <p className="text-xs text-red-400">{rejectError}</p>}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                id="btn-cancel-reject"
                onClick={() => setRejectTarget(null)}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-semibold transition disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-reject"
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
