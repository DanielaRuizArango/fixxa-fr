import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search,
  Mail,
  AlertCircle,
  Briefcase,
  MapPin,
  Lock,
  Unlock,
  Eye,
} from "lucide-react";
import { isTechnicianVerified } from "../../utils/technicianVerification";
import VerifiedBadge from "../common/VerifiedBadge";
import MainLayout from "../templates/MainLayout";
import { fetchData, getProfileImageUrl } from "../../api";

const IndexTechnicianAdmin = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadTechnicians = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append("page", page);
      if (searchTerm) queryParams.append("search", searchTerm);
      if (statusFilter) queryParams.append("status", statusFilter);
      if (cityFilter) queryParams.append("city", cityFilter);
      if (verifiedFilter === "verified") queryParams.append("is_verified", "1");
      if (verifiedFilter === "unverified") queryParams.append("is_verified", "0");

      const response = await fetchData(`/admin/technicians?${queryParams.toString()}`);
      const paginated = response.data ?? response;
      const list = paginated?.data || (Array.isArray(paginated) ? paginated : []);

      if (append) {
        setTechnicians((prev) => [...prev, ...list]);
      } else {
        setTechnicians(list);
      }

      setHasMore(!!paginated?.next_page_url);
      setCurrentPage(page);
    } catch (err) {
      setError("Error al cargar la lista de técnicos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, cityFilter, verifiedFilter]);

  useEffect(() => {
    loadTechnicians(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTechnicians(1, false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, cityFilter, verifiedFilter, loadTechnicians]);

  const handleBlockToggle = async (id) => {
    try {
      const response = await fetchData(`/admin/technicians/${id}/block`, {
        method: "PATCH",
      });

      setTechnicians((prev) =>
        prev.map((tech) =>
          tech.id === id ? { ...tech, status: response.data.status } : tech
        )
      );
    } catch (err) {
      alert("Error al actualizar el estado del técnico.");
      console.error(err);
    }
  };

  const displayedTechnicians = verifiedFilter
    ? technicians.filter((tech) => {
        const verified = isTechnicianVerified(tech);
        if (verifiedFilter === "verified") return verified;
        if (verifiedFilter === "unverified") return !verified;
        return true;
      })
    : technicians;

  return (
    <MainLayout roleName="Administrator" profileRoute="/adminProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <div>
          <h1 className="text-2xl font-bold font-['Kadwa']">Gestión de Técnicos</h1>
          <p className="text-gray-400 text-sm">Administra los usuarios registrados como técnicos</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#262f31]/50 border border-white/5 rounded-2xl focus:border-[#8C7E97] focus:outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#262f31]/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8C7E97] cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="blocked">Bloqueados</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="bg-[#262f31]/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8C7E97] cursor-pointer"
            >
              <option value="">Verificación</option>
              <option value="verified">Verificados</option>
              <option value="unverified">Sin verificar</option>
            </select>

            <input
              type="text"
              placeholder="Ciudad..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-[#262f31]/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8C7E97] w-32"
            />
          </div>
        </div>

        {loading && technicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Obteniendo técnicos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
             <AlertCircle className="mx-auto mb-2 text-red-500" />
             <p className="text-red-200">{error}</p>
          </div>
        ) : displayedTechnicians.length === 0 ? (
          <div className="bg-[#262f31]/50 border border-white/5 p-8 rounded-2xl text-center">
            <p className="text-gray-400 text-sm">
              {searchTerm || statusFilter || cityFilter || verifiedFilter
                ? "No se encontraron técnicos con los filtros aplicados."
                : "Aún no hay técnicos registrados."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTechnicians.map((tech) => {
              const verified = isTechnicianVerified(tech);
              return (
                <div key={tech.id} className="bg-[#262f31]/80 border border-white/5 rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-[#262f31] shadow-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1C2526] flex items-center justify-center border border-[#8C7E97]/30 shrink-0">
                      {getProfileImageUrl(tech) ? (
                        <img src={getProfileImageUrl(tech)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Briefcase size={24} className="text-[#8C7E97]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <h3 className="font-bold text-white truncate">{tech.name || tech.user?.name}</h3>
                        {verified && <VerifiedBadge variant="badge" />}
                      </div>
                      <p className="text-[#8C7E97] text-xs font-semibold uppercase truncate">{tech.title || tech.technician?.title || "Especialista"}</p>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1 truncate"><Mail size={12} className="shrink-0" /> <span className="truncate">{tech.email || tech.user?.email}</span></span>
                        <span className="flex items-center gap-1 truncate"><MapPin size={12} className="shrink-0" /> <span className="truncate">{tech.city || tech.user?.city || "No especificada"}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
                    <button 
                      onClick={() => navigate(`/admin/technician-detail/${tech.id}`)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all bg-white/5 text-[#8C7E97] hover:bg-[#8C7E97]/10 border border-[#8C7E97]/20"
                    >
                      <Eye size={14} />
                      <span>EXPEDIENTE</span>
                    </button>
                    {localStorage.getItem("role") !== "moderator" && (
                      <button 
                        onClick={() => handleBlockToggle(tech.id)}
                        className={`p-2 rounded-lg transition-colors ${tech.status === "active" ? "text-gray-400 hover:text-yellow-400" : "text-yellow-400 hover:text-green-400"}`}
                        title={tech.status === "active" ? "Bloquear" : "Desbloquear"}
                      >
                        {tech.status === "active" ? <Lock size={20} /> : <Unlock size={20} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div className="flex justify-center mt-8 w-full col-span-full">
                <button
                  onClick={() => loadTechnicians(currentPage + 1, true)}
                  disabled={loading}
                  className="px-8 py-3 bg-[#8C7E97] hover:bg-[#8C7E97]/80 text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#8C7E97]/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Cargar más técnicos"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default IndexTechnicianAdmin;
