import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  ArrowLeft,
  Briefcase,
  Award,
  MessageSquare,
  Image as ImageIcon,
  Clock
} from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData, getStorageUrl } from "../../api";

const TechnicianPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tech, setTech] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "Usuario";

  useEffect(() => {
    const loadTechData = async () => {
      try {
        setLoading(true);
        const response = await fetchData(`/technicians/${id}/profile`);
        setTech(response.data);
      } catch (err) {
        setError("No se pudo cargar el perfil del técnico.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTechData();
  }, [id]);

  if (loading) {
    return (
      <MainLayout roleName={userName} profileRoute={role === 'client' ? '/customerProfile' : '/technicianProfile'}>
        <div className="flex flex-col items-center justify-center pt-24">
          <div className="w-12 h-12 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Cargando perfil del técnico...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !tech) {
    return (
      <MainLayout roleName={userName} profileRoute={role === 'client' ? '/customerProfile' : '/technicianProfile'}>
        <div className="text-center pt-24">
          <p className="text-red-400 mb-4">{error || "Técnico no encontrado."}</p>
          <button onClick={() => navigate(-1)} className="text-[#8C7E97] hover:underline flex items-center justify-center gap-2 mx-auto">
            <ArrowLeft size={16} /> Volver
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout roleName={userName} profileRoute={role === 'client' ? '/customerProfile' : '/technicianProfile'}>
      <div className="flex flex-col gap-8 pb-20 pt-4">
        
        <button
          onClick={() => navigate(-1)}
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
                {tech.image ? (
                  <img src={getStorageUrl(tech.image)} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-[#1C2526] flex items-center justify-center text-[#8C7E97]">
                    <User size={48} />
                  </div>
                )}
              </div>
              <h1 className="text-xl font-bold text-white mb-1">{tech.name}</h1>
              <p className="text-[#8C7E97] text-xs font-bold uppercase tracking-widest mb-4">{tech.title || 'Técnico Especialista'}</p>
              
              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 mb-6">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold">{tech.average_rating || 'N/A'}</span>
                <span className="text-[10px] text-yellow-500/60 font-medium">({tech.ratings?.length || 0} reseñas)</span>
              </div>

              <div className="w-full space-y-3">
                <InfoRow icon={<MapPin size={14} />} label="Ciudad" value={tech.city} />
                <InfoRow icon={<Clock size={14} />} label="Horario" value={tech.working_hours || 'No definido'} />
              </div>
            </div>

            <div className="bg-[#262f31] border border-white/5 rounded-3xl p-6 shadow-xl">
               <div className="flex items-center gap-2 mb-4">
                  <ImageIcon size={18} className="text-[#8C7E97]" />
                  <h3 className="font-bold text-sm">Portafolio y Documentos</h3>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  {tech.assets?.map((asset) => (
                    <div key={asset.id} className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-[#8C7E97]/50 transition-all cursor-zoom-in group">
                       <img src={getStorageUrl(asset.file_path)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                  ))}
                  {(!tech.assets || tech.assets.length === 0) && (
                    <p className="col-span-2 text-[10px] text-gray-500 text-center py-4 italic">No hay archivos públicos.</p>
                  )}
               </div>
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
                 "{tech.experience || 'Sin descripción de experiencia proporcionada.'}"
               </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-2">
                 <MessageSquare size={20} className="text-[#8C7E97]" />
                 <h2 className="text-xl font-bold text-white">Reseñas de Clientes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {tech.ratings?.map((rating) => (
                    <div key={rating.id} className="bg-[#262f31] border border-white/5 rounded-2xl p-5 shadow-lg">
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-[#8C7E97]/20 flex items-center justify-center text-[10px] font-bold text-[#8C7E97]">
                                {rating.service_case?.client?.user?.name?.charAt(0).toUpperCase() || 'C'}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">{rating.service_case?.client?.user?.name || 'Cliente Fixxa'}</span>
                                <span className="text-[10px] text-gray-500">{new Date(rating.created_at).toLocaleDateString()}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-yellow-500">
                             <Star size={12} fill="currentColor" />
                             <span className="text-xs font-bold">{rating.score}</span>
                          </div>
                       </div>
                       <p className="text-xs text-gray-400 italic">"{rating.comment || 'Sin comentario.'}"</p>
                    </div>
                 ))}
                 {(!tech.ratings || tech.ratings.length === 0) && (
                    <p className="col-span-full text-center text-gray-500 py-10 bg-white/5 rounded-2xl border border-dashed border-white/5 text-sm">El técnico aún no tiene reseñas.</p>
                 )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-left p-2.5 bg-black/20 rounded-xl border border-white/5">
    <div className="text-[#8C7E97]">
      {icon}
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[8px] uppercase font-bold text-gray-500 leading-tight">{label}</span>
      <span className="text-xs text-gray-200 truncate font-medium">{value}</span>
    </div>
  </div>
);

export default TechnicianPublicProfile;
