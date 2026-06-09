import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api";
import AssetManager from "./AssetManager";
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Lock, Clock, FileText, Award, CreditCard } from "lucide-react";

/* ── helpers ─────────────────────────────────────────── */
const inputBase =
  "w-full p-3 pl-10 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none transition placeholder:text-white/30";

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="flex-1 h-px bg-gradient-to-r from-[#8c7e97]/60 to-transparent" />
    <span className="text-xs font-semibold tracking-widest text-[#8c7e97] uppercase whitespace-nowrap">
      {children}
    </span>
    <div className="flex-1 h-px bg-gradient-to-l from-[#8c7e97]/60 to-transparent" />
  </div>
);

const FieldIcon = ({ icon: Icon }) => (
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7e97]">
    <Icon size={16} />
  </span>
);

const FileDropZone = ({ label, icon: Icon, fileName, onChange, accept, multiple, previewUrl, previewList, error }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-[#c8d2d4]">{label}</label>
    <label
      className={`flex flex-col items-center justify-center gap-2 bg-[#1f2a2b] rounded-xl p-4 cursor-pointer border-2 border-dashed transition-all duration-200 ${
        error ? "border-red-500" : "border-[#3f4b4d] hover:border-[#8c7e97]"
      }`}
    >
      <Icon size={28} className="text-[#8c7e97]" />
      <span className="text-sm text-[#8c7e97] text-center">
        {fileName
          ? fileName
          : multiple
          ? "Elige uno o varios archivos"
          : "Haz clic para elegir un archivo"}
      </span>
      <span className="text-[10px] text-white/30">{accept?.replace(/,/g, " · ")}</span>
      <input type="file" accept={accept} onChange={onChange} multiple={multiple} className="hidden" />
    </label>

    {/* single image preview */}
    {previewUrl && (
      <img
        src={previewUrl}
        alt="Vista previa"
        className="rounded-xl object-cover w-full h-40 border border-[#3f4b4d]"
      />
    )}

    {/* multi-file preview */}
    {previewList && previewList.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {previewList.map((f, i) =>
          f.type?.startsWith("image/") ? (
            <img
              key={i}
              src={URL.createObjectURL(f)}
              alt={`cert-${i}`}
              className="rounded-lg object-cover w-20 h-20 border border-[#3f4b4d]"
            />
          ) : (
            <div
              key={i}
              className="flex items-center gap-1 bg-[#2a363a] rounded-lg px-3 py-2 text-xs text-[#8c7e97] border border-[#3f4b4d]"
            >
              <FileText size={14} />
              <span className="max-w-[120px] truncate">{f.name}</span>
            </div>
          )
        )}
      </div>
    )}
  </div>
);

/* ── main component ──────────────────────────────────── */
const EditTechnician = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [user, setUser] = useState({
    image: null,
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    password: "",
    id_number: "",
    title: "",
    experience: "",
    working_hours: "",
    is_available: true,
    id_photo: null,
    certificates: [],
  });

  const [preview, setPreview] = useState("");
  const [idPhotoPreview, setIdPhotoPreview] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchData("/technician/me");
        const data = response.data;
        setUser((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "",
          address: data.address || "",
          password: "",
          id_number: data.id_number || "",
          title: data.technician?.title || "",
          experience: data.technician?.experience || "",
          working_hours: data.technician?.working_hours || "",
          is_available: data.technician?.is_available ?? true,
        }));

        if (data.image) {
          setPreview(
            data.image.startsWith("http")
              ? data.image
              : `${import.meta.env.VITE_API_STORAGE_URL || ""}/${data.image}`
          );
        }

        if (data.technician?.id_photo) {
          const photoPath = data.technician.id_photo;
          setIdPhotoPreview(
            photoPath.startsWith("http")
              ? photoPath
              : `${import.meta.env.VITE_API_STORAGE_URL || ""}/${photoPath}`
          );
        }
      } catch (err) {
        setError("Error al cargar el perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUser((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleIdPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUser((prev) => ({ ...prev, id_photo: file }));
    setIdPhotoPreview(URL.createObjectURL(file));
  };

  const handleCertificatesChange = (e) => {
    const files = Array.from(e.target.files);
    setUser((prev) => ({ ...prev, certificates: files }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("phone", user.phone);
    formData.append("city", user.city);
    formData.append("address", user.address);
    formData.append("title", user.title);
    formData.append("experience", user.experience);
    formData.append("working_hours", user.working_hours);
    formData.append("is_available", user.is_available ? "1" : "0");
    if (user.image) formData.append("image", user.image);
    if (user.password) formData.append("password", user.password);
    if (user.id_photo) formData.append("id_photo", user.id_photo);
    user.certificates.forEach((f, i) => formData.append(`certificates[${i}]`, f));

    try {
      await fetchData("/technician/profile", { method: "POST", body: formData });
      setSuccess(true);
      setTimeout(() => navigate("/technicianProfile"), 1200);
    } catch (err) {
      setError(err.message || "Error al actualizar el perfil.");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C2526] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8c7e97] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm animate-pulse">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  /* ── main render ── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C2526] via-[#212d2e] to-[#1C2526] py-10 px-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed left-4 top-4 md:left-8 md:top-6 flex items-center gap-2 bg-[#2a363a] border border-[#3f4b4d] hover:border-[#8c7e97] px-4 py-2 rounded-xl transition text-white text-sm z-20"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="w-full max-w-lg mx-auto">
        {/* Header card */}
        <div className="bg-gradient-to-br from-[#262f31] to-[#1f2829] rounded-3xl p-8 shadow-2xl border border-[#3f4b4d] mb-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#8c7e97] shadow-lg shadow-[#8c7e97]/20">
                <img
                  src={preview || "/images/fixxa-logo.svg"}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Camera size={22} className="text-white" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Editar Perfil</h1>
              <p className="text-white/40 text-sm mt-1">Técnico</p>
            </div>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-3 rounded-xl mb-5 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl mb-5 text-sm text-center">
              ✓ Perfil actualizado correctamente
            </div>
          )}

          <form id="edit-technician-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* ── Información personal ── */}
            <SectionTitle>Información Personal</SectionTitle>

            {/* Nombre */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Nombre Completo</label>
              <div className="relative">
                <FieldIcon icon={User} />
                <input type="text" name="name" value={user.name} onChange={handleChange} required className={inputBase} />
              </div>
            </div>

            {/* Correo */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Correo Electrónico</label>
              <div className="relative">
                <FieldIcon icon={Mail} />
                <input type="email" name="email" value={user.email} onChange={handleChange} required className={inputBase} />
              </div>
            </div>

            {/* Teléfono + ID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#c8d2d4]">Teléfono</label>
                <div className="relative">
                  <FieldIcon icon={Phone} />
                  <input type="tel" name="phone" value={user.phone} onChange={handleChange} className={inputBase} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#c8d2d4]">Documento ID</label>
                <div className="relative">
                  <FieldIcon icon={CreditCard} />
                  <input type="text" name="id_number" value={user.id_number} onChange={handleChange} className={inputBase} />
                </div>
              </div>
            </div>

            {/* Ciudad */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Ciudad</label>
              <div className="relative">
                <FieldIcon icon={MapPin} />
                <input type="text" name="city" value={user.city} onChange={handleChange} className={inputBase} />
              </div>
            </div>

            {/* Dirección */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Dirección</label>
              <div className="relative">
                <FieldIcon icon={MapPin} />
                <input type="text" name="address" value={user.address} onChange={handleChange} className={inputBase} />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Nueva Contraseña <span className="text-white/30 font-normal">(opcional)</span></label>
              <div className="relative">
                <FieldIcon icon={Lock} />
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para mantener actual"
                  className={inputBase}
                />
              </div>
            </div>

            {/* ── Perfil Profesional ── */}
            <SectionTitle>Perfil Profesional</SectionTitle>

            {/* Título */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Título / Especialidad</label>
              <div className="relative">
                <FieldIcon icon={Award} />
                <input
                  type="text"
                  name="title"
                  value={user.title}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Técnico en refrigeración"
                  className={inputBase}
                />
              </div>
            </div>

            {/* Horario */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Horario de Atención</label>
              <div className="relative">
                <FieldIcon icon={Clock} />
                <input
                  type="text"
                  name="working_hours"
                  value={user.working_hours}
                  onChange={handleChange}
                  placeholder="Ej: Lunes a Viernes 8am – 6pm"
                  className={inputBase}
                />
              </div>
            </div>

            {/* Experiencia */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Experiencia</label>
              <textarea
                name="experience"
                value={user.experience}
                onChange={handleChange}
                rows="3"
                placeholder="Describe brevemente tu trayectoria profesional..."
                className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none resize-none transition placeholder:text-white/30"
              />
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center justify-between p-4 bg-[#1f2a2b] rounded-xl border border-[#3f4b4d]">
              <div>
                <p className="text-sm font-medium text-white">Disponibilidad</p>
                <p className="text-[11px] text-white/40 mt-0.5">Actívala para recibir nuevos casos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={user.is_available}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#3f4b4d] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8c7e97]" />
              </label>
            </div>

            {/* ── Documentos ── */}
            <SectionTitle>Documentos de Verificación</SectionTitle>

            <FileDropZone
              label="Foto de Cédula"
              icon={CreditCard}
              accept="image/*"
              fileName={user.id_photo?.name}
              onChange={handleIdPhotoChange}
              previewUrl={idPhotoPreview}
            />

            <FileDropZone
              label="Certificados"
              icon={FileText}
              accept="image/*,application/pdf"
              multiple
              fileName={
                user.certificates.length > 0
                  ? `${user.certificates.length} archivo(s) seleccionado(s)`
                  : null
              }
              onChange={handleCertificatesChange}
              previewList={user.certificates}
            />
          </form>
        </div>

        {/* ── Galería ── */}
        <div className="bg-gradient-to-br from-[#262f31] to-[#1f2829] rounded-3xl p-8 shadow-2xl border border-[#3f4b4d] mb-6">
          <SectionTitle>Galería Profesional</SectionTitle>
          <p className="text-center text-white/40 text-sm mb-6">
            Sube fotos de tus herramientas, certificaciones y trabajos previos para generar más confianza.
          </p>
          <AssetManager />
        </div>

        {/* ── Botones ── */}
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            form="edit-technician-form"
            disabled={updating}
            className={`w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all duration-200 ${
              updating
                ? "bg-[#8c7e97]/50 cursor-not-allowed"
                : "bg-[#8c7e97] hover:bg-[#a493bd] shadow-lg shadow-[#8c7e97]/20 hover:shadow-[#8c7e97]/40"
            }`}
          >
            {updating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              "Guardar Cambios"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/technicianProfile")}
            className="w-full py-3.5 rounded-xl border border-[#3f4b4d] text-white/60 hover:border-[#8c7e97] hover:text-white transition text-base"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTechnician;
