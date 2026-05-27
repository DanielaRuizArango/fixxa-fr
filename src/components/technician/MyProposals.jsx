import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit3, MessageSquare, DollarSign, Clock, MapPin, CheckCircle, XCircle, Search, AlertCircle, FileText } from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData, getStorageUrl } from "../../api";
import Swal from "sweetalert2";

const MyProposals = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Technical");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros y Pestañas
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'pending', 'accepted', 'resolved'
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Estado del Modal de Edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [editCost, setEditCost] = useState("");
  const [editQuestions, setEditQuestions] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      
      let queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      queryParams.append('page', page);

      const res = await fetchData(`/technician/responses/mine?${queryParams.toString()}`);
      // El endpoint devuelve una estructura paginada: response.data.data o response.data
      const rawData = res.data?.data || res.data || [];
      
      if (append) {
        setResponses(prev => [...prev, ...rawData]);
      } else {
        setResponses(rawData);
      }
      
      setHasMore(!!(res.data?.next_page_url || res.next_page_url));
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error("Error al cargar propuestas:", err);
      setError("Error al cargar tus propuestas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userResponse = await fetchData('/technician/me');
        setUserName(userResponse.data?.name || "Technical");
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 400); // Debounce para búsqueda
    return () => clearTimeout(timeoutId);
  }, [loadData]);

  // Filtrar localmente según la pestaña activa
  const filteredResponses = responses.filter(resp => {
    const serviceCase = resp.service_case;
    if (!serviceCase) return false;

    // Verificar si esta propuesta fue aceptada por el cliente
    const isAccepted = serviceCase.accepted_technician_id === resp.technician_id;

    if (activeTab === "pending") {
      // Propuesta pendiente: no ha sido aceptada y el caso está activo o respondido
      return !isAccepted && ['active', 'responded'].includes(serviceCase.status);
    }
    if (activeTab === "accepted") {
      // Propuesta aceptada/trabajo en progreso: caso pendiente/in progress
      return isAccepted && serviceCase.status === 'pending';
    }
    if (activeTab === "resolved") {
      // Caso solucionado
      return serviceCase.status === 'resolved';
    }
    return true; // 'all'
  });

  // Abrir Modal de Edición
  const openEditModal = (proposal) => {
    setEditingProposal(proposal);
    setEditCost(proposal.estimated_cost);
    setEditQuestions(proposal.questions || "");
    setIsEditModalOpen(true);
  };

  // Guardar Edición
  const handleSaveProposal = async (e) => {
    e.preventDefault();
    if (!editCost || parseFloat(editCost) < 0) {
      Swal.fire({
        icon: "warning",
        title: "Costo inválido",
        text: "Por favor ingresa un costo estimado válido.",
        background: "#1C2526",
        color: "#fff",
        confirmButtonColor: "#8C7E97"
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetchData(`/technician/responses/${editingProposal.id}`, {
        method: "PUT",
        body: JSON.stringify({
          estimated_cost: editCost,
          questions: editQuestions
        })
      });

      if (response.status === "success" || response.message) {
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Tu propuesta ha sido modificada con éxito.",
          background: "#1C2526",
          color: "#fff",
          confirmButtonColor: "#8C7E97",
          timer: 2000,
          showConfirmButton: false
        });

        // Actualizar el estado localmente
        setResponses(prev => prev.map(item => {
          if (item.id === editingProposal.id) {
            return {
              ...item,
              estimated_cost: parseFloat(editCost),
              questions: editQuestions
            };
          }
          return item;
        }));

        setIsEditModalOpen(false);
        setEditingProposal(null);
      }
    } catch (err) {
      console.error("Error al actualizar propuesta:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo actualizar la propuesta.",
        background: "#1C2526",
        color: "#fff",
        confirmButtonColor: "#8C7E97"
      });
    } finally {
      setSaving(false);
    }
  };

  // Abrir o iniciar conversación con el cliente
  const handleContactClient = async (caseId) => {
    try {
      const chatResponse = await fetchData("/chat/start", {
        method: "POST",
        body: JSON.stringify({ service_case_id: caseId }),
      });
      const convId = chatResponse.data?.id || chatResponse.id;
      if (convId) {
        navigate(`/chat/${convId}`);
      } else {
        throw new Error("No se pudo iniciar la conversación");
      }
    } catch (err) {
      console.error("Error al abrir chat:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo conectar con el cliente.",
        background: "#1C2526",
        color: "#fff",
        confirmButtonColor: "#8C7E97",
      });
    }
  };

  return (
    <MainLayout roleName={localStorage.getItem('userName') || userName} profileRoute="/technicianProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20 max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-['Kadwa'] text-white">Mis Propuestas y Trabajos</h1>
            <p className="text-sm text-gray-400 mt-1">Administra tus ofertas, haz seguimiento a tus trabajos en progreso o revisa tus servicios finalizados.</p>
          </div>
          
          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por título de caso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#262f31] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#8C7E97] transition-all"
            />
          </div>
        </div>

        {/* Barra de Pestañas */}
        <div className="flex border-b border-white/10 overflow-x-auto pb-px gap-2">
          {[
            { id: "all", label: "Todas" },
            { id: "pending", label: "Propuestas Pendientes" },
            { id: "accepted", label: "Trabajos en Progreso" },
            { id: "resolved", label: "Servicios Finalizados" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-[#8C7E97] text-[#8C7E97]"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido / Listado */}
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400 text-sm">Cargando tus registros...</p>
          </div>
        ) : error ? (
          <div className="text-center pt-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => loadData()} className="text-[#8C7E97] underline">Reintentar</button>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="text-center bg-[#262f31]/40 border border-white/5 rounded-3xl p-12 mt-4">
            <FileText className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 font-medium">No se encontraron propuestas en esta pestaña.</p>
            <button
              onClick={() => navigate("/indexTechnician")}
              className="mt-4 inline-flex items-center gap-2 bg-[#8C7E97] hover:bg-[#8C7E97]/80 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              Buscar Casos Activos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredResponses.map((item) => {
              const serviceCase = item.service_case;
              const isAccepted = serviceCase?.accepted_technician_id === item.technician_id;
              
              // Estado del caso en español para renderizado premium
              let statusLabel = "Abierto";
              let statusColor = "bg-green-500/10 text-green-300 border-green-500/20";
              
              if (serviceCase.status === 'pending') {
                statusLabel = "Aceptado / En Progreso";
                statusColor = "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
              } else if (serviceCase.status === 'resolved') {
                statusLabel = "Solucionado / Finalizado";
                statusColor = "bg-blue-500/10 text-blue-300 border-blue-500/20";
              } else if (serviceCase.status === 'responded') {
                statusLabel = "Con Propuestas";
                statusColor = "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
              } else if (serviceCase.status === 'cancelled') {
                statusLabel = "Cancelado";
                statusColor = "bg-red-500/10 text-red-300 border-red-500/20";
              }

              // ¿Se puede editar?
              // "si el cliente no la ha aceptado y el caso no esta resuelto"
              const canEdit = !isAccepted && ['active', 'responded'].includes(serviceCase.status);

              return (
                <div
                  key={item.id}
                  className="bg-[#262f31]/75 hover:bg-[#262f31] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-5 transition-all shadow-md group"
                >
                  <div className="flex-1 flex flex-col justify-between gap-2">
                    <div>
                      {/* Estado y Código */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] text-gray-500 font-mono">
                          FTS-{serviceCase.id.toString().padStart(6, '0')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      
                      {/* Título */}
                      <h3 className="text-lg font-bold text-white group-hover:text-[#8C7E97] transition-colors line-clamp-1">
                        {serviceCase.title}
                      </h3>
                      
                      {/* Detalles del Caso */}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-[#8C7E97]" />
                          {serviceCase.city || "No especificada"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-[#8C7E97]" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Contenido de la Propuesta */}
                    <div className="mt-4 bg-[#1c2526]/50 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-sm text-white font-bold mb-1">
                        <DollarSign size={16} className="text-green-400" />
                        <span>Costo Propuesto: <span className="text-green-400">${parseFloat(item.estimated_cost).toLocaleString()}</span></span>
                      </div>
                      {item.questions && (
                        <p className="text-xs text-gray-400 line-clamp-2 italic">
                          " {item.questions} "
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-row md:flex-col justify-end items-center md:items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    <button
                      onClick={() => navigate(`/case-detail/${serviceCase.id}`)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-[#8C7E97]/10 hover:bg-[#8C7E97]/25 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-[#8C7E97]/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Eye size={14} />
                      Ver Detalles
                    </button>

                    {/* Botón Chat: Solo si está aceptado o el caso está en progreso */}
                    {isAccepted && !['resolved', 'cancelled'].includes(serviceCase.status) && (
                      <button
                        onClick={() => handleContactClient(serviceCase.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-green-500/10 hover:bg-green-500/25 text-green-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-green-500/20 transition-all active:scale-95 whitespace-nowrap"
                      >
                        <MessageSquare size={14} />
                        Conversar
                      </button>
                    )}

                    {/* Botón Editar: Solo si califica */}
                    {canEdit && (
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/25 text-yellow-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-yellow-500/20 transition-all active:scale-95 whitespace-nowrap"
                      >
                        <Edit3 size={14} />
                        Editar Propuesta
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => loadData(currentPage + 1, true)}
                  className="px-6 py-2.5 bg-[#8C7E97] hover:bg-[#8C7E97]/80 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  Cargar más propuestas
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Edición de Propuesta */}
      {isEditModalOpen && editingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#262f31] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Cabecera Modal */}
            <div className="p-5 border-b border-white/5 bg-[#1c2526] flex justify-between items-center text-white">
              <div>
                <h3 className="font-bold text-lg font-['Kadwa']">Editar Propuesta</h3>
                <span className="text-xs text-gray-400">Caso: {editingProposal.service_case?.title}</span>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingProposal(null); }}
                className="p-1 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition"
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveProposal} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Costo Estimado ($ COP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Ej: 80000"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full bg-[#1c2526] border border-white/5 rounded-xl py-3 pl-8 pr-4 text-white text-sm focus:outline-none focus:border-[#8C7E97]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mensaje / Comentarios para el Cliente</label>
                <textarea
                  rows="4"
                  placeholder="Explica qué incluye tu oferta o haz preguntas aclaratorias..."
                  value={editQuestions}
                  onChange={(e) => setEditQuestions(e.target.value)}
                  className="w-full bg-[#1c2526] border border-white/5 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#8C7E97] resize-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingProposal(null); }}
                  className="px-5 py-2.5 bg-[#4c5462]/30 hover:bg-[#4c5462]/50 text-gray-300 rounded-xl text-sm font-bold transition active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#8C7E97] hover:bg-[#8C7E97]/80 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition active:scale-95 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default MyProposals;
