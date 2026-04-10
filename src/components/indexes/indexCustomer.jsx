import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, MessageSquare, Clock, AlertCircle, Eye, Image as ImageIcon } from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData, getStorageUrl } from "../../api";

const IndexCustomer = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("Customer");

  useEffect(() => {
    const loadCases = async () => {
      try {
        const userResponse = await fetchData('/client/me');
        setUserName(userResponse.data?.name || "Customer");
        const response = await fetchData('/client/cases');
        setCases(response.data || []);
      } catch (err) {
        setError("Error al cargar tus casos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default: return 'bg-[#1C2526] text-[#c8d2d4] border-[#3f4b4d]';
    }
  };

  return (
    <MainLayout roleName={localStorage.getItem('userName') || userName} profileRoute="/customerProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">
        
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold font-['Kadwa']">Mis Casos de Servicio</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Obteniendo tus casos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
             <AlertCircle className="mx-auto mb-2 text-red-500" />
             <p className="text-red-200">{error}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-[#2B2F36] border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center">
            <div className="bg-[#1C2526] p-5 rounded-full mb-4">
              <Plus size={40} className="text-[#8C7E97]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No tienes casos creados</h2>
            <p className="text-gray-400 max-w-sm mb-6">
              Empieza creando tu primer caso para que los técnicos puedan ofrecerte sus servicios.
            </p>
            <button 
              onClick={() => navigate("/createCases")}
              className="px-6 py-2 bg-[#8C7E97] text-white rounded-xl hover:bg-[#77678a] transition shadow-lg"
            >
              Crear mi primer caso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {cases.map((serviceCase) => (
              <div 
                key={serviceCase.id}
                onClick={() => navigate(`/case-detail/${serviceCase.id}`)}
                className="bg-[#262f31]/80 hover:bg-[#262f31] border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all shadow-md group cursor-pointer"
              >
                {/* Imagen del caso */}
                <div className="w-full md:w-32 lg:w-48 h-48 md:h-auto bg-[#1c2526] relative overflow-hidden flex-shrink-0">
                  {serviceCase.images && serviceCase.images.length > 0 ? (
                    <img 
                      src={getStorageUrl(serviceCase.images[0].image_path)} 
                      alt={serviceCase.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(serviceCase.status)}`}>
                        {serviceCase.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(serviceCase.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#8C7E97] transition-colors line-clamp-1">{serviceCase.title}</h3>
                    <p className="text-[#c8d2d4] text-sm line-clamp-2 mb-4 leading-relaxed">
                      {serviceCase.description}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-[#8C7E97] font-medium">
                      <div className="flex items-center gap-1.5 bg-[#8C7E97]/10 px-3 py-1.5 rounded-xl border border-[#8C7E97]/20">
                        <MessageSquare size={16} />
                        <span>{serviceCase.responses?.length || 0} Propuestas / Interesados</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 items-end self-stretch md:self-center">
                    <div className="flex flex-row md:flex-col gap-3 justify-end items-center md:items-end w-full md:w-auto">
                      <p className="text-xs font-mono text-gray-500 hidden md:block">FTS-{serviceCase.id.toString().padStart(6, '0')}</p>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/case-detail/${serviceCase.id}`); }}
                          className="p-2 text-[#8C7E97] hover:text-white transition-colors hover:bg-white/5 rounded-lg" 
                          title="Ver detalles y respuestas"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/editCase/${serviceCase.id}`); }}
                          className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg" 
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); /* delete logic */ }}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors hover:bg-white/5 rounded-lg" 
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/case-detail/${serviceCase.id}`)}
                      className="flex md:hidden items-center gap-2 px-4 py-2 bg-[#8C7E97] text-white rounded-xl text-xs font-bold"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante para crear nuevo caso */}
      {!loading && cases.length > 0 && (
        <button
          onClick={() => navigate("/createCases")}
          className="fixed bottom-10 right-10 bg-[#8C7E97] p-4 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-white hover:bg-[#a493bd] group"
          title="Crear nuevo caso"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

    </MainLayout>
  );
};

export default IndexCustomer;