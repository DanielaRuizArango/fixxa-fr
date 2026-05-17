import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Clock, 
  ShieldAlert, 
  Terminal, 
  ChevronLeft, 
  ChevronRight,
  Globe
} from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";

const IndexLogsAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const availableActions = [
    { value: "", label: "Todas las acciones" },
    { value: "create_case", label: "Crear Caso (Cliente)" },
    { value: "update_case", label: "Actualizar Caso (Cliente)" },
    { value: "delete_case", label: "Eliminar Caso (Cliente/Admin)" },
    { value: "send_proposal", label: "Enviar Propuesta (Técnico)" },
    { value: "accept_proposal", label: "Aceptar Propuesta (Cliente)" },
    { value: "reject_proposal", label: "Rechazar Propuesta (Cliente)" },
    { value: "resolve_case", label: "Resolver Caso (Cliente)" },
    { value: "submit_rating", label: "Calificar Servicio (Cliente)" },
    { value: "upload_asset", label: "Subir Certificación (Técnico)" },
    { value: "delete_asset", label: "Eliminar Documento (Técnico)" },
    { value: "block_client", label: "Bloquear Cliente (Admin)" },
    { value: "unblock_client", label: "Desbloquear Cliente (Admin)" },
    { value: "block_technician", label: "Bloquear Técnico (Admin)" },
    { value: "unblock_technician", label: "Desbloquear Técnico (Admin)" },
    { value: "approve_certification", label: "Aprobar Certificación (Admin)" },
    { value: "reject_certification", label: "Rechazar Certificación (Admin)" },
  ];

  const loadLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      queryParams.append('page', page);
      if (searchTerm) queryParams.append('search', searchTerm);
      if (actionFilter) queryParams.append('action', actionFilter);
      if (dateFilter) queryParams.append('date', dateFilter);

      const response = await fetchData(`/admin/logs?${queryParams.toString()}`);
      
      const paginatedData = response.data;
      setLogs(paginatedData?.data || []);
      setCurrentPage(paginatedData?.current_page || 1);
      setLastPage(paginatedData?.last_page || 1);
      setTotal(paginatedData?.total || 0);
    } catch (err) {
      setError("Error al cargar la bitácora de auditoría.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, actionFilter, dateFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadLogs(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [loadLogs]);

  // Obtener badge estilizado según el rol del usuario que realiza la acción
  const getRoleBadge = (user) => {
    if (!user) return <span className="text-gray-500 text-[10px]">Sistema</span>;
    
    const roleName = user.roles?.[0]?.name || user.spatie_role || 'usuario';

    const badges = {
      super_admin: "bg-red-500/10 text-red-400 border border-red-500/20",
      admin: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      moderator: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      client: "bg-green-500/10 text-green-400 border border-green-500/20",
      technician: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    };

    const labels = {
      super_admin: "Super Admin",
      admin: "Admin",
      moderator: "Moderador",
      client: "Cliente",
      technician: "Técnico",
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badges[roleName] || "bg-gray-500/10 text-gray-400 border border-gray-500/20"}`}>
        {labels[roleName] || roleName}
      </span>
    );
  };

  const getActionBadge = (action) => {
    const actions = {
      block_user: "bg-red-500/20 text-red-300",
      unblock_user: "bg-green-500/20 text-green-300",
      block_client: "bg-red-500/20 text-red-300",
      unblock_client: "bg-green-500/20 text-green-300",
      block_technician: "bg-red-500/20 text-red-300",
      unblock_technician: "bg-green-500/20 text-green-300",
      approve_certification: "bg-purple-500/20 text-purple-300",
      reject_certification: "bg-gray-500/20 text-gray-300",
      create_case: "bg-blue-500/20 text-blue-300",
      update_case: "bg-amber-500/20 text-amber-300",
      delete_case: "bg-red-500/20 text-red-300",
      send_proposal: "bg-indigo-500/20 text-indigo-300",
      accept_proposal: "bg-emerald-500/20 text-emerald-300",
      reject_proposal: "bg-rose-500/20 text-rose-300",
      resolve_case: "bg-teal-500/20 text-teal-300",
      submit_rating: "bg-yellow-500/20 text-yellow-300",
      upload_asset: "bg-cyan-500/20 text-cyan-300",
      delete_asset: "bg-red-500/20 text-red-300",
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold ${actions[action] || "bg-white/5 text-gray-300"}`}>
        {action}
      </span>
    );
  };

  return (
    <MainLayout roleName="Administrator" profileRoute="/adminProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-['Kadwa'] flex items-center gap-2">
              <Terminal size={24} className="text-[#8C7E97]" /> Bitácora de Auditoría
            </h1>
            <p className="text-gray-400 text-sm">Historial completo de acciones y operaciones en Fixxa</p>
          </div>
          <div className="bg-[#1C2526] px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
               Total registros: <span className="text-[#8C7E97] font-extrabold">{total}</span>
             </span>
          </div>
        </div>

        {/* Buscador y Filtros reactivos */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descripción, acción o nombre de usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#262f31]/50 border border-white/5 rounded-2xl focus:border-[#8C7E97] focus:outline-none transition-all placeholder:text-gray-600 text-sm text-white"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#262f31]/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8C7E97] cursor-pointer"
            >
              {availableActions.map(action => (
                <option key={action.value} value={action.value} className="bg-[#1C2526] text-white">
                  {action.label}
                </option>
              ))}
            </select>

            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#262f31]/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8C7E97] cursor-pointer text-gray-300"
              title="Filtrar por fecha"
            />

            {(actionFilter || dateFilter || searchTerm) && (
              <button
                onClick={() => {
                  setActionFilter("");
                  setDateFilter("");
                  setSearchTerm("");
                }}
                className="px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 rounded-2xl transition-all"
              >
                LIMPIAR
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Obteniendo bitácora...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
             <ShieldAlert className="mx-auto mb-2 text-red-500" />
             <p className="text-red-200">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-[#262f31] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5">
                      <th className="px-6 py-4">Usuario / Actor</th>
                      <th className="px-6 py-4">Acción</th>
                      <th className="px-6 py-4">Descripción</th>
                      <th className="px-6 py-4">Dirección IP</th>
                      <th className="px-6 py-4">Fecha y Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#8C7E97]/25 flex items-center justify-center text-[10px] font-bold text-[#8C7E97]">
                              {log.admin?.name?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-gray-200">{log.admin?.name || "Sistema"}</span>
                              <div className="flex items-center gap-1.5">
                                {getRoleBadge(log.admin)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="px-6 py-4 max-w-xs md:max-w-md">
                          <p className="text-gray-300 font-medium break-words leading-relaxed">{log.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                            <Globe size={12} className="text-gray-600" />
                            {log.ip_address || "127.0.0.1"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                            <Clock size={12} className="text-gray-600" />
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center text-gray-500 font-medium">
                          No se encontraron registros de auditoría que coincidan con la búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between px-4 mt-2">
                <span className="text-xs text-gray-500">
                  Página <strong className="text-white">{currentPage}</strong> de <strong className="text-white">{lastPage}</strong>
                </span>
                
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1 || loading}
                    onClick={() => loadLogs(currentPage - 1)}
                    className="p-2.5 rounded-xl border border-white/5 bg-[#262f31] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <button
                    disabled={currentPage === lastPage || loading}
                    onClick={() => loadLogs(currentPage + 1)}
                    className="p-2.5 rounded-xl border border-white/5 bg-[#262f31] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
        
      </div>
    </MainLayout>
  );
};

export default IndexLogsAdmin;
