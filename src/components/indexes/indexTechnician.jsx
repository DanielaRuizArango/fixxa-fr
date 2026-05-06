import { useNavigate } from "react-router-dom";
import { Plus, Users, Image as ImageIcon, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData, getStorageUrl } from "../../api";
import { useState, useEffect, useCallback } from "react";

const IndexTechnical = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Technical");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [userCoords, setUserCoords] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construir query string
      let queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (city) queryParams.append('city', city);
      if (radius && userCoords) {
        queryParams.append('radius', radius);
        queryParams.append('lat', userCoords.lat);
        queryParams.append('lng', userCoords.lng);
      }
      if (serviceType) queryParams.append('service_type', serviceType);
      
      // Agregar ordenamiento
      queryParams.append('sort_by', sortBy);
      queryParams.append('sort_order', sortOrder);

      const casesResponse = await fetchData(`/technician/cases?${queryParams.toString()}`);
      setCases(casesResponse.data?.data || casesResponse.data || []);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
      setError("Error al cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  }, [search, city, radius, userCoords, serviceType, sortBy, sortOrder]);

  useEffect(() => {
    const loadUser = async () => {
        try {
            const userResponse = await fetchData('/technician/me');
            setUserName(userResponse.data?.name || "Technical");
            
            // Intentar obtener ubicación del usuario desde su perfil o navegador
            if (userResponse.data?.latitude && userResponse.data?.longitude) {
                setUserCoords({
                    lat: userResponse.data.latitude,
                    lng: userResponse.data.longitude
                });
            } else {
                // Si no tiene en el perfil, intentar navegador
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserCoords({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    },
                    (err) => console.log("Geolocalización no permitida")
                );
            }
        } catch (err) {
            console.error("Error al cargar perfil:", err);
        }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        loadData();
    }, 500); // Debounce para la búsqueda
    return () => clearTimeout(timeoutId);
  }, [loadData]);

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setRadius("");
    setServiceType("");
    setSortBy("created_at");
    setSortOrder("desc");
    setShowFilters(false);
  };

  return (
    <MainLayout roleName={localStorage.getItem('userName') || userName} profileRoute="/technicianProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">
        
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-['Kadwa']">Solicitudes Activas</h1>
          </div>

          {/* Buscador y Botón de Filtros */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por título o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#262f31] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#8C7E97] transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-all ${showFilters || city || radius || serviceType || sortBy !== 'created_at' ? 'bg-[#8C7E97] border-[#8C7E97] text-white' : 'bg-[#262f31] border-white/10 text-gray-400'}`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* Panel de Filtros */}
          {showFilters && (
            <div className="bg-[#262f31] border border-white/10 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-200">Filtros y Orden</h3>
                <button onClick={clearFilters} className="text-xs text-[#8C7E97] hover:underline">Limpiar filtros</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej: Bogotá"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-[#1c2526] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#8C7E97]"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium">Radio de cercanía (km)</label>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="bg-[#1c2526] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#8C7E97]"
                  >
                    <option value="">Cualquier distancia</option>
                    <option value="5">A menos de 5 km</option>
                    <option value="10">A menos de 10 km</option>
                    <option value="20">A menos de 20 km</option>
                    <option value="50">A menos de 50 km</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium">Tipo de Asistencia</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="bg-[#1c2526] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#8C7E97]"
                  >
                    <option value="">Cualquier tipo</option>
                    <option value="presential">Presencial</option>
                    <option value="remote">Remota</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#1c2526] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#8C7E97]"
                  >
                    <option value="created_at">Fecha de creación</option>
                    <option value="responses_count">Número de respuestas</option>
                    <option value="client_name">Nombre del cliente</option>
                    <option value="city">Ciudad</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium">Orden</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-[#1c2526] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#8C7E97]"
                  >
                    <option value="desc">Descendente (Más reciente/mayor)</option>
                    <option value="asc">Ascendente (Más antiguo/menor)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Filtrando solicitudes...</p>
          </div>
        ) : error ? (
          <div className="text-center pt-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => loadData()} className="text-[#8C7E97] underline">Reintentar</button>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center pt-20">
            <p className="text-gray-400">No se encontraron solicitudes con estos filtros.</p>
            {(search || city || radius) && (
              <button onClick={clearFilters} className="mt-4 text-[#8C7E97] border border-[#8C7E97] px-4 py-2 rounded-xl text-sm">Ver todos los casos</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-[#262f31]/80 hover:bg-[#262f31] border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all cursor-pointer shadow-lg group"
                onClick={() => navigate(`/case-detail/${caseItem.id}`)}
              >
                {/* Imagen del caso */}
                <div className="w-full md:w-48 h-48 md:h-auto bg-[#1c2526] relative overflow-hidden">
                  {caseItem.images && caseItem.images.length > 0 ? (
                    <img 
                      src={getStorageUrl(caseItem.images[0].image_path)} 
                      alt={caseItem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <ImageIcon size={40} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-[#1c2526]/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-gray-300 font-mono">
                    FTS-{caseItem.id.toString().padStart(6, '0')}
                  </div>
                </div>

                <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#8C7E97] transition-colors line-clamp-1">
                        {caseItem.title || caseItem.name || 'Solicitud de Servicio'}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                      {caseItem.description || 'Sin descripción detallada.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                      <MapPin size={14} className="text-[#8C7E97]" />
                      <span>{caseItem.city || caseItem.client?.user?.city || 'No especificada'}</span>
                      {caseItem.distance && (
                        <span className="text-gray-500 ml-1">({Math.round(caseItem.distance)} km)</span>
                      )}
                    </div>

                    <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${caseItem.service_type === 'remote' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-orange-500/10 text-orange-300 border-orange-500/20'}`}>
                      <span className="font-semibold">
                        {caseItem.service_type === 'remote' ? 'REMOTA' : 'PRESENCIAL'}
                      </span>
                    </div>

                    {caseItem.responses?.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                        <Users size={14} />
                        <span className="font-semibold">
                          {caseItem.responses.length} {caseItem.responses.length === 1 ? 'técnico interesado' : 'técnicos interesados'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </MainLayout>
  );
};

export default IndexTechnical;