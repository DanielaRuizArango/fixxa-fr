import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, User, Mail, Phone, MapPin, ArrowLeft, Briefcase, Award, Star, Clock, ImageIcon, X, MessageSquare } from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData, getStorageUrl } from "../../api";
import { isTechnicianVerified } from "../../utils/technicianVerification";
import VerifiedBadge from "../common/VerifiedBadge";

const DOCUMENT_SECTIONS = [
  { type: "id_document", label: "Cédula" },
  { type: "certification", label: "Certificados" },
  { type: "tool", label: "Portafolio" },
  { type: "work", label: "Trabajos" },
];

const assetStatus = (asset) => asset.approval_status ?? asset.status ?? "pending";

const REVIEWABLE_TYPES = new Set(["id_document", "certification"]);

const DocumentAssetCard = ({ asset, onZoom }) => {
  const status = assetStatus(asset);
  const showReviewStatus = REVIEWABLE_TYPES.has(asset.type);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-[#8C7E97]/50 transition-all cursor-zoom-in group relative"
        onClick={() => onZoom(getStorageUrl(asset.image_path))}
      >
        <img
          src={getStorageUrl(asset.image_path)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt={asset.description || "Documento"}
        />
        {showReviewStatus && (
          <div
            className={`absolute top-1 right-1 px-2 py-0.5 rounded text-[10px] font-bold ${
              status === "approved"
                ? "bg-green-500/80"
                : status === "rejected"
                  ? "bg-red-500/80"
                  : "bg-yellow-500/80"
            }`}
          >
            {status === "approved" ? "✓ Aprobado" : status === "rejected" ? "✗ Rechazado" : "⏱ Pendiente"}
          </div>
        )}
      </div>
      {asset.description && (!showReviewStatus || status !== "rejected") && (
        <p className="text-[10px] text-gray-500 truncate">{asset.description}</p>
      )}
      {showReviewStatus && status === "rejected" && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-red-400 mb-1">
            Motivo de rechazo
          </p>
          <p className="text-[11px] text-red-200 leading-relaxed">
            {asset.rejection_reason || "No se especificó un motivo. Contacta al administrador."}
          </p>
        </div>
      )}
    </div>
  );
};

const TechnicianProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [ratingsData, setRatingsData] = useState(null);
  const [zoomedImg, setZoomedImg] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileResponse, ratingsResponse] = await Promise.all([
          fetchData('/technician/me'),
          fetchData('/technician/my-rating').catch(() => null),
        ]);

        const techData = profileResponse.data;
        setData(techData);
        if (ratingsResponse?.data) {
          setRatingsData(ratingsResponse.data);
        }
        if (techData?.name) {
          localStorage.setItem('userName', techData.name);
        }
        
        // Cargar assets del técnico
        try {
          const assetsResponse = await fetchData('/technician/assets');
          const assetsData = Array.isArray(assetsResponse) ? assetsResponse : (assetsResponse.data || []);
          setData(prev => ({
            ...prev,
            assets: assetsData
          }));
        } catch (err) {
          console.log("No se pudieron cargar los assets:", err);
        }
      } catch (err) {
        setError("No se pudo cargar la información del perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <MainLayout roleName={localStorage.getItem('userName') || data?.name || "Technician"} profileRoute="/technicianProfile">
        <div className="flex flex-col items-center justify-center pt-20">
          <div className="w-12 h-12 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-300">Cargando perfil...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout roleName={localStorage.getItem('userName') || data?.name || "Technician"} profileRoute="/technicianProfile">
        <div className="text-center pt-20">
          <p className="text-red-400 mb-4">{error || "Error al cargar datos."}</p>
          <button onClick={() => navigate("/indexTechnician")} className="text-[#8C7E97] hover:underline">
            Volver al inicio
          </button>
        </div>
      </MainLayout>
    );
  }

  const isVerified = isTechnicianVerified({
    ...data,
    is_verified: data.technician?.is_verified,
    assets: data.assets,
  });

  const averageRating = ratingsData?.average_score ?? data.average_rating ?? data.technician?.average_rating;
  const ratingsCount = ratingsData?.total_ratings
    ?? (Array.isArray(data.ratings) ? data.ratings.length : data.technician?.ratings_count ?? 0);
  const recentRatings = ratingsData?.ratings?.data ?? (Array.isArray(data.ratings) ? data.ratings : []);

  return (
    <MainLayout roleName={data.name} profileRoute="/technicianProfile">
      <div className="flex flex-col gap-8 pb-20 pt-4 px-4">
        
        <button
          onClick={() => navigate("/indexTechnician")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={20} />
          <span>Regresar</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Columna Izquierda */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#262f31] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-[#8C7E97]/20">
                {data.image ? (
                  <img src={getStorageUrl(data.image)} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-[#1C2526] flex items-center justify-center text-[#8C7E97]">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 justify-center">
                <h1 className="text-xl font-bold text-white">{data.name}</h1>
                {isVerified && <VerifiedBadge variant="badge" className="mt-0.5" />}
              </div>
              {!isVerified && (
                <p className="text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                  Para obtener el sello Verificado necesitas: cédula aprobada y todas tus certificaciones aprobadas.
                </p>
              )}
              <p className="text-[#8C7E97] text-xs font-bold uppercase tracking-widest mb-4">{data.technician?.title || 'Técnico Especialista'}</p>
              
              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 mb-6">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold">{averageRating ?? 'N/A'}</span>
                <span className="text-[10px] text-yellow-500/60 font-medium">({ratingsCount} reseñas)</span>
              </div>

              <div className="w-full space-y-3">
                <InfoRow icon={<MapPin size={14} />} label="Ciudad" value={data.city} />
                <InfoRow icon={<Clock size={14} />} label="Horario" value={data.technician?.working_hours || 'No definido'} />
                <InfoRow icon={<Phone size={14} />} label="Teléfono" value={data.phone || 'No definido'} />
                <InfoRow icon={<Mail size={14} />} label="Email" value={data.email} />
              </div>

              <button
                onClick={() => navigate("/editTechnician")}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#8C7E97] hover:bg-[#77678a] px-4 py-2 rounded-lg transition shadow-md text-white"
              >
                <Pencil size={16} />
                Editar Perfil
              </button>
            </div>

          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <div className="bg-[#262f31] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Briefcase size={80} />
               </div>
               <div className="flex items-center gap-3 mb-4">
                  <Award size={24} className="text-[#8C7E97]" />
                  <h2 className="text-xl font-bold">Experiencia</h2>
               </div>
               <p className="text-gray-300 leading-relaxed italic bg-white/5 p-6 rounded-2xl border border-white/5">
                 "{data.technician?.experience || 'Sin descripción de experiencia proporcionada.'}"
               </p>
            </div>

            <div className="bg-[#262f31] border border-white/5 rounded-3xl p-6 shadow-xl">
               <div className="flex items-center gap-2 mb-4">
                  <ImageIcon size={18} className="text-[#8C7E97]" />
                  <h3 className="font-bold text-sm">Mis Documentos</h3>
               </div>
               <div className="space-y-6">
                  {DOCUMENT_SECTIONS.map(({ type, label }) => {
                    const sectionAssets = data.assets?.filter((asset) => asset.type === type) ?? [];
                    if (sectionAssets.length === 0) return null;

                    return (
                      <div key={type}>
                        <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">{label}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {sectionAssets.map((asset) => (
                            <DocumentAssetCard
                              key={asset.id}
                              asset={asset}
                              onZoom={setZoomedImg}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {(!data.assets || data.assets.length === 0) && (
                    <p className="text-[10px] text-gray-500 text-center py-4 italic">No has subido documentos.</p>
                  )}
               </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#8C7E97]" />
                  <h2 className="text-xl font-bold text-white">Reseñas de Clientes</h2>
                </div>
                {ratingsCount > 0 && (
                  <button
                    onClick={() => navigate("/my-ratings")}
                    className="text-xs text-[#8C7E97] hover:text-white transition-colors"
                  >
                    Ver todas
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentRatings.map((rating) => (
                  <div key={rating.id} className="bg-[#262f31] border border-white/5 rounded-2xl p-5 shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#8C7E97]/20 flex items-center justify-center text-[10px] font-bold text-[#8C7E97] shrink-0">
                          {(rating.client?.user?.name || rating.service_case?.client?.user?.name)?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white break-words">
                            {rating.client?.user?.name || rating.service_case?.client?.user?.name || 'Cliente Fixxa'}
                          </span>
                          <span className="text-[10px] text-gray-500">{new Date(rating.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-yellow-500 shrink-0">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{rating.score}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 italic break-words whitespace-pre-wrap leading-relaxed">
                      "{rating.comment || 'Sin comentario.'}"
                    </p>
                  </div>
                ))}
                {recentRatings.length === 0 && (
                  <p className="col-span-full text-center text-gray-500 py-10 bg-white/5 rounded-2xl border border-dashed border-white/5 text-sm">
                    Aún no tienes reseñas de clientes.
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {zoomedImg && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
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
            alt="Documento ampliado"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </MainLayout>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 text-left p-2.5 bg-black/20 rounded-xl border border-white/5">
    <div className="text-[#8C7E97] shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-[8px] uppercase font-bold text-gray-500 leading-tight">{label}</span>
      <span className="text-xs text-gray-200 font-medium break-words whitespace-normal leading-relaxed">{value || "—"}</span>
    </div>
  </div>
);

export default TechnicianProfile;
