import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Eye, Calendar, User, CheckCircle, Wrench, FileText } from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData, getStorageUrl } from "../../api";

const MyRatingsClient = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || "Cliente";
  
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadRatings = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      
      const response = await fetchData(`/client/ratings?page=${page}`);
      const rawData = response.data?.data || response.data || [];
      
      if (append) {
        setRatings(prev => [...prev, ...rawData]);
      } else {
        setRatings(rawData);
      }
      
      setHasMore(!!(response.data?.next_page_url || response.next_page_url));
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error("Error al cargar calificaciones:", err);
      setError("No se pudieron cargar las calificaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  return (
    <MainLayout roleName={userName} profileRoute="/customerProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20 max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-['Kadwa'] text-white">Técnicos Calificados</h1>
            <p className="text-sm text-gray-400 mt-1">Revisa el historial de calificaciones que has otorgado a los técnicos por sus servicios.</p>
          </div>
        </div>

        {/* Contenido / Listado */}
        {loading && ratings.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400 text-sm">Cargando calificaciones...</p>
          </div>
        ) : error && ratings.length === 0 ? (
          <div className="text-center pt-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => loadRatings()} className="text-[#8C7E97] underline">Reintentar</button>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center bg-[#262f31]/40 border border-white/5 rounded-3xl p-12 mt-4">
            <Star className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 font-medium">Aún no has calificado a ningún técnico.</p>
            <p className="text-sm text-gray-500 mt-2">Los casos resueltos te permitirán calificar la calidad del servicio.</p>
            <button
              onClick={() => navigate("/indexCustomer")}
              className="mt-6 inline-flex items-center gap-2 bg-[#8C7E97] hover:bg-[#8C7E97]/80 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              Ver Casos Activos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ratings.map((rating) => {
              const tech = rating.technician;
              const techUser = tech?.user;
              const caseObj = rating.service_case;
              
              const techName = techUser?.name || "Técnico Desconocido";
              const techEmail = techUser?.email || "";
              
              return (
                <div
                  key={rating.id}
                  className="bg-[#262f31]/75 hover:bg-[#262f31] border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-md group relative overflow-hidden"
                >
                  {/* Detalles del Técnico */}
                  <div className="flex items-start gap-4">
                    <div 
                      onClick={() => navigate(`/technician-profile/${tech?.id}`)}
                      className="w-12 h-12 rounded-full bg-[#8C7E97]/20 flex items-center justify-center text-[#8C7E97] shrink-0 cursor-pointer hover:bg-[#8C7E97]/30 transition-colors border border-[#8C7E97]/30"
                    >
                      {techUser?.image ? (
                         <img src={getStorageUrl(techUser.image)} alt={techName} className="w-full h-full object-cover rounded-full" />
                      ) : (
                         <User size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p 
                        onClick={() => navigate(`/technician-profile/${tech?.id}`)}
                        className="font-bold text-white text-base leading-tight cursor-pointer hover:text-[#8C7E97] transition-colors truncate"
                      >
                        {techName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{techEmail}</p>
                      
                      {/* Puntaje */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={`${star <= rating.score ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comentario y Detalles del Caso */}
                  <div className="bg-[#1c2526]/50 rounded-xl p-4 border border-white/5 flex-1">
                    {rating.comment ? (
                      <p className="text-sm text-gray-300 italic mb-3">"{rating.comment}"</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic mb-3">Sin comentario</p>
                    )}
                    
                    <div className="flex flex-col gap-1.5 mt-auto border-t border-white/5 pt-3">
                       <p className="text-xs text-gray-400 flex items-center gap-1.5">
                         <Wrench size={12} className="text-[#8C7E97]" />
                         <span className="truncate">Caso: {caseObj?.title || `FTS-${rating.service_case_id}`}</span>
                       </p>
                       <p className="text-xs text-gray-400 flex items-center gap-1.5">
                         <Calendar size={12} className="text-[#8C7E97]" />
                         <span>{new Date(rating.created_at).toLocaleDateString()}</span>
                       </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/case-detail/${rating.service_case_id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#8C7E97]/10 hover:bg-[#8C7E97]/25 text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#8C7E97]/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <FileText size={14} />
                      Ver Caso
                    </button>
                    <button
                      onClick={() => navigate(`/technician-profile/${tech?.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#8C7E97]/10 hover:bg-[#8C7E97]/25 text-[#d7c4ff] text-xs font-bold px-3 py-2 rounded-xl border border-[#8C7E97]/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <User size={14} />
                      Perfil del Técnico
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => loadRatings(currentPage + 1, true)}
              className="px-6 py-2.5 bg-[#8C7E97] hover:bg-[#8C7E97]/80 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
            >
              Cargar más
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyRatingsClient;
