import { useState, useEffect, useRef } from "react";
import { fetchData, getStorageUrl } from "../../api";
import {
  Trash2, Plus, Briefcase, Award, Image as ImageIcon,
  CheckCircle, XCircle, Upload, AlertCircle, Loader2, ZoomIn, X,
} from "lucide-react";

/* ─── Certification status badge helper ─────────────────────── */
const CertBadge = ({ asset }) => {
  const s = asset.approval_status ?? asset.status ?? "pending";
  if (s === "approved")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold">
        <CheckCircle size={12} /> Aprobado
      </span>
    );
  if (s === "rejected")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold">
        <XCircle size={12} /> Rechazado
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold">
      <AlertCircle size={12} /> Pendiente de revisión
    </span>
  );
};

/* ─── Certification upload panel ────────────────────────────── */
const CertificationSection = ({ certs, onAdd, onDelete, uploading, maxCerts = 5 }) => {
  const certsCount = certs.length;
  const atLimit = certsCount >= maxCerts;
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [desc, setDesc]         = useState("");
  const [error, setError]       = useState("");
  const [zoomedImg, setZoomedImg] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async () => {
    if (!file) { setError("Selecciona una imagen primero."); return; }
    setError("");
    await onAdd(file, desc.trim());
    setFile(null);
    setPreview(null);
    setDesc("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const cancelPreview = () => {
    setFile(null);
    setPreview(null);
    setDesc("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      {/* Lightbox */}
      {zoomedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomedImg(null)}
        >
          <button
            onClick={() => setZoomedImg(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
          >
            <X size={22} />
          </button>
          <img
            src={zoomedImg}
            alt="Certificado"
            className="max-w-full max-h-[88vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#8C7E97]/20 border border-[#8C7E97]/30">
            <Award size={20} className="text-[#8C7E97]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Certificaciones</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                atLimit
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-[#8C7E97]/20 text-[#d7c4ff] border-[#8C7E97]/30'
              }`}>
                {certsCount} / {maxCerts}
              </span>
            </div>
            <p className="text-xs text-white/40">Sube tus certificados; un administrador los revisará antes de mostrarlos.</p>
          </div>
        </div>

        {/* ── Upload card ── */}
        <div className="bg-[#1f2a2b] border border-dashed border-[#8C7E97]/40 rounded-2xl p-5 flex flex-col gap-4">
          {atLimit ? (
          /* Limit reached notice */
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertCircle size={22} className="text-red-400" />
            </div>
            <p className="text-sm font-semibold text-red-300">Límite alcanzado</p>
            <p className="text-xs text-white/30">Has subido el máximo de {maxCerts} certificaciones. Elimina una para agregar otra.</p>
          </div>
        ) : !preview ? (
            /* Drop zone */
            <label className={`flex flex-col items-center justify-center gap-3 cursor-pointer py-6 group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="p-4 rounded-full bg-[#8C7E97]/10 group-hover:bg-[#8C7E97]/20 transition border border-[#8C7E97]/20">
                <Upload size={28} className="text-[#8C7E97]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white/70 group-hover:text-white transition">
                  Haz clic para seleccionar imagen
                </p>
                <p className="text-xs text-white/30 mt-1">JPG, PNG, WEBP — máx. 5 MB</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleFileChange}
              />
            </label>
          ) : (
            /* Preview + form */
            <div className="flex flex-col gap-4">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <img src={preview} alt="Vista previa" className="w-full h-full object-contain" />
                <button
                  onClick={cancelPreview}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition"
                  title="Cancelar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Descripción <span className="normal-case font-normal text-white/30">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ej: Certificado en refrigeración industrial – 2024"
                  className="w-full p-3 rounded-xl bg-[#262f31] border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#8C7E97] transition"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={cancelPreview}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#8C7E97] hover:bg-[#a493bd] text-white text-sm font-semibold transition disabled:opacity-50"
                >
                  {uploading
                    ? <><Loader2 size={16} className="animate-spin" /> Subiendo…</>
                    : <><Upload size={16} /> Subir certificado</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Existing certs list ── */}
        {certs.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase font-bold text-white/30 tracking-widest">Tus certificados</p>
            <div className="flex flex-col gap-3">
              {certs.map((cert) => {
                const rejected = (cert.approval_status ?? cert.status) === "rejected";
                return (
                  <div
                    key={cert.id}
                    className={`flex gap-4 p-4 rounded-2xl border ${
                      rejected
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-[#262f31] border-white/5"
                    } group`}
                  >
                    {/* thumbnail */}
                    <div
                      className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-[#1a2324] cursor-zoom-in relative"
                      onClick={() => setZoomedImg(getStorageUrl(cert.image_path))}
                    >
                      <img
                        src={getStorageUrl(cert.image_path)}
                        alt="Certificado"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/40">
                        <ZoomIn size={18} className="text-white" />
                      </div>
                    </div>

                    {/* info */}
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-white font-medium truncate">
                          {cert.description || "Sin descripción"}
                        </p>
                        <button
                          onClick={() => onDelete(cert.id)}
                          className="flex-shrink-0 p-1.5 rounded-full text-white/20 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <CertBadge asset={cert} />

                      {rejected && cert.rejection_reason && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-xs text-red-300 leading-relaxed">
                          <span className="font-bold">Motivo: </span>{cert.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {certs.length === 0 && !file && (
          <p className="text-center text-xs text-white/20 italic py-2">Aún no has subido ningún certificado.</p>
        )}
      </div>
    </>
  );
};

/* ─── Main AssetManager ──────────────────────────────────────── */
const AssetManager = () => {
  const [assets, setAssets]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState(null);

  const nonCertTypes = [
    { id: "tool", label: "Herramientas", icon: <Briefcase size={20} /> },
    { id: "work", label: "Trabajos Previos", icon: <ImageIcon size={20} /> },
  ];

  useEffect(() => { loadAssets(); }, []);

  const loadAssets = async () => {
    try {
      const response = await fetchData("/technician/assets");
      setAssets(response.data);
    } catch (err) {
      console.error("Error al cargar activos:", err);
      setError("No se pudieron cargar las fotos.");
    } finally {
      setLoading(false);
    }
  };

  /* Generic upload (tools / works) */
  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);
    try {
      const response = await fetchData("/technician/assets", { method: "POST", body: formData });
      setAssets((prev) => [...prev, response.data]);
    } catch (err) {
      console.error("Error al subir activo:", err);
      setError("Error al subir la imagen. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  /* Certification upload (with description) */
  const handleCertUpload = async (file, description) => {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", "certification");
    if (description) formData.append("description", description);
    try {
      const response = await fetchData("/technician/assets", { method: "POST", body: formData });
      setAssets((prev) => [...prev, response.data]);
    } catch (err) {
      console.error("Error al subir certificado:", err);
      setError("Error al subir el certificado. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este archivo?")) return;
    try {
      await fetchData(`/technician/assets/${id}`, { method: "DELETE" });
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error al eliminar activo:", err);
      setError("Error al eliminar la imagen.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-10 gap-3 text-white/40">
        <Loader2 size={20} className="animate-spin" /> Cargando galería…
      </div>
    );

  return (
    <div className="flex flex-col gap-10 mt-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {/* ── Dedicated Certifications section ── */}
      <CertificationSection
        certs={assets.filter((a) => a.type === "certification")}
        onAdd={handleCertUpload}
        onDelete={handleDelete}
        uploading={uploading}
        maxCerts={5}
      />

      <div className="border-t border-white/5" />

      {/* ── Tools & Works grid ── */}
      {nonCertTypes.map((type) => (
        <div key={type.id} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2 text-[#c8d2d4]">
              {type.icon} {type.label}
            </h3>
            <label
              className={`cursor-pointer flex items-center gap-2 bg-[#8c7e97] hover:bg-[#a493bd] text-white px-4 py-2 rounded-full text-sm font-medium transition ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Plus size={16} /> Añadir
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleFileUpload(e, type.id)}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {assets
              .filter((a) => a.type === type.id)
              .map((asset) => (
                <div
                  key={asset.id}
                  className="relative group aspect-square rounded-2xl overflow-hidden border border-[#3f4b4d] bg-[#1f2a2b]"
                >
                  <img
                    src={getStorageUrl(asset.image_path)}
                    alt={type.label}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            {assets.filter((a) => a.type === type.id).length === 0 && (
              <div className="col-span-full py-8 border-2 border-dashed border-[#3f4b4d] rounded-2xl flex flex-col items-center justify-center text-white/30 text-sm italic">
                No hay fotos de {type.label.toLowerCase()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetManager;
