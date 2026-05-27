import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, MessageSquare, Clock, AlertCircle, Eye, Image as ImageIcon, Search, SlidersHorizontal, XCircle, CheckCircle, X } from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData, getStorageUrl } from "../../api";
import Swal from "sweetalert2";

const IndexCustomer = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("Customer");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadCases = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const userResponse = await fetchData('/client/me');
      setUserName(userResponse.data?.name || "Customer");

      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (typeFilter) queryParams.append('service_type', typeFilter);

      // Agregar ordenamiento
      queryParams.append('sort_by', sortBy);
      queryParams.append('sort_order', sortOrder);

      // Agregar página
      queryParams.append('page', page);

      const response = await fetchData(`/client/cases?${queryParams.toString()}`);
      const newData = response.data?.data || response.data || [];

      if (append) {
        setCases(prev => [...prev, ...newData]);
      } else {
        setCases(newData);
      }

      setHasMore(!!response.data?.next_page_url);
      setCurrentPage(page);
    } catch (err) {
      setError("Error al cargar tus casos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCases();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [loadCases]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default: return 'bg-[#1C2526] text-[#c8d2d4] border-[#3f4b4d]';
    }
  };

  const handleResolveCase = async (e, caseId) => {
    e.stopPropagation();
    const result = await Swal.fire({
      icon: "question",
      title: "Terminar caso",
      text: "¿Confirmas que el trabajo ha sido completado? Podrás calificar al técnico a continuación.",
      showCancelButton: true,
      confirmButtonText: "Sí, terminar",
      cancelButtonText: "Cancelar",
      background: "#1C2526",
      color: "#ffffff",
      confirmButtonColor: "#8C7E97",
      cancelButtonColor: "#4C5462",
    });
    if (!result.isConfirmed) return;
    try {
      await fetchData(`/client/cases/${caseId}/resolve`, { method: "PATCH" });
      await Swal.fire({
        icon: "success",
        title: "¡Caso terminado!",
        text: "Ahora puedes calificar al técnico.",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      navigate(`/case-detail/${caseId}`);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo terminar el caso.",
        background: "#1C2526",
        color: "#fff",
        confirmButtonColor: "#8C7E97",
      });
    }
  };

  const canEditCase = (serviceCase) => {
    if (serviceCase.status === 'active') return true;
    return serviceCase.status === 'pending' && (!serviceCase.responses || serviceCase.responses.length === 0);
  };

  const handleDeleteCase = async (e, caseId) => {
    e.stopPropagation();
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar Caso",
      text: "¿Estás seguro de que deseas eliminar este caso? Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, mantener",
      background: "#1C2526",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#4C5462",
    });
    if (!result.isConfirmed) return;
    try {
      await fetchData(`/client/cases/${caseId}`, { method: "DELETE" });
      await Swal.fire({
        icon: "success",
        title: "Caso eliminado",
        text: "El caso ha sido eliminado exitosamente.",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      loadCases(1);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo eliminar el caso.",
        background: "#1C2526",
        color: "#fff",
        confirmButtonColor: "#8C7E97",
      });
    }
  };

  const handleCancelCase = async (e, caseId) => {
    e.stopPropagation();
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancelar Caso",
      text: "¿Estás seguro de que deseas cancelar este caso? Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener",
      background: "#1C2526",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#4C5462",
    });
    if (!result.isConfirmed) return;
    try {
      await fetchData(`/client/cases/${caseId}/cancel`, { method: "PATCH" });
      await Swal.fire({
        icon: "success",
        title: "Caso cancelado",
        text: "El caso ha sido cancelado exitosamente.",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      loadCases(1); // recargar desde la primera página
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo cancelar el caso.",
        background: "#1C2526",
        color: "#fff",
        confirmButtonColor: "#8C7E97",
      });
    }
  };

  return (
    <MainLayout roleName={localStorage.getItem('userName') || userName} profileRoute="/customerProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-['Kadwa']">Mis Casos</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#262f31] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#8C7E97] transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#262f31] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#8C7E97] cursor-pointer"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="pending">Pendientes</option>
                <option value="responded">Respondidos</option>
                <option value="resolved">Resueltos</option>
                <option value="cancelled">Cancelados</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#262f31] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#8C7E97] cursor-pointer"
              >
                <option value="">Cualquier asistencia</option>
                <option value="presential">Presencial</option>
                <option value="remote">Remota</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#262f31] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#8C7E97] cursor-pointer"
              >
                <option value="created_at">Fecha creación</option>
                <option value="responses_count">Más respuestas</option>
                <option value="technician_name">Nombre técnico</option>
                <option value="status">Estado</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-[#262f31] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#8C7E97] cursor-pointer"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
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
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${serviceCase.service_type === 'remote' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-orange-500/20 text-orange-300 border-orange-500/50'}`}>
                        {serviceCase.service_type === 'remote' ? 'REMOTA' : 'PRESENCIAL'}
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
                        {canEditCase(serviceCase) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/editCase/${serviceCase.id}`); }}
                            className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        {serviceCase.status === 'active' && !serviceCase.accepted_technician_id && (
                          <button
                            onClick={(e) => handleDeleteCase(e, serviceCase.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors hover:bg-white/5 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        {serviceCase.status === 'active' && (
                          <button
                            onClick={(e) => handleResolveCase(e, serviceCase.id)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors hover:bg-emerald-500/10 rounded-lg"
                            title="Terminar caso"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {(['active', 'pending', 'responded'].includes(serviceCase.status)) && (
                          <button
                            onClick={(e) => handleCancelCase(e, serviceCase.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors hover:bg-white/5 rounded-lg"
                            title="Cancelar Caso"
                          >
                            <X size={18} />
                          </button>
                        )}
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
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => loadCases(currentPage + 1, true)}
                  className="px-8 py-3 bg-[#8C7E97] hover:bg-[#8C7E97]/80 text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#8C7E97]/20 active:scale-95"
                >
                  {loading ? 'Cargando...' : 'Cargar más casos'}
                </button>
              </div>
            )}
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