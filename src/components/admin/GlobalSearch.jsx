import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Wrench, Loader2, X } from "lucide-react";
import { fetchData, getProfileImageUrl } from "../../api";

/**
 * GlobalSearch — Búsqueda global de usuarios para admins.
 * Busca en paralelo clientes y técnicos y muestra resultados agrupados.
 */
const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ clients: [], technicians: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const totalResults = results.clients.length + results.technicians.length;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar con Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const search = useCallback(async (term) => {
    if (!term.trim() || term.trim().length < 2) {
      setResults({ clients: [], technicians: [] });
      setIsOpen(false);
      return;
    }
    setLoading(true);
    setIsOpen(true);
    try {
      const params = new URLSearchParams({ search: term, per_page: 5 }).toString();
      const [clientRes, techRes] = await Promise.all([
        fetchData(`/admin/clients?${params}`).catch(() => null),
        fetchData(`/admin/technicians?${params}`).catch(() => null),
      ]);

      const clients = clientRes?.data?.data || clientRes?.data || [];
      const technicians = techRes?.data?.data || techRes?.data || [];

      setResults({
        clients: Array.isArray(clients) ? clients.slice(0, 5) : [],
        technicians: Array.isArray(technicians) ? technicians.slice(0, 5) : [],
      });
    } catch (err) {
      console.error("GlobalSearch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce 400ms
  useEffect(() => {
    const timeout = setTimeout(() => search(query), 400);
    return () => clearTimeout(timeout);
  }, [query, search]);

  const handleSelect = (path) => {
    setIsOpen(false);
    setQuery("");
    navigate(path);
  };

  const clearSearch = () => {
    setQuery("");
    setResults({ clients: [], technicians: [] });
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {/* Input */}
      <div className="relative flex items-center">
        <Search
          size={16}
          className="absolute left-3 text-white/50 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => totalResults > 0 && setIsOpen(true)}
          placeholder="Buscar usuario..."
          className="w-52 bg-white/10 border border-white/20 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:w-72 transition-all duration-300"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 text-white/40 hover:text-white transition"
          >
            <X size={14} />
          </button>
        )}
        {loading && (
          <Loader2
            size={14}
            className="absolute right-2 text-white/60 animate-spin"
          />
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[#1c2526] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Header del dropdown */}
          <div className="px-4 py-2.5 bg-[#262f31] border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E97]">
              Búsqueda Global
            </span>
            {!loading && (
              <span className="text-[10px] text-gray-500">
                {totalResults} resultado{totalResults !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
                <Loader2 size={18} className="animate-spin text-[#8C7E97]" />
                <span className="text-sm">Buscando...</span>
              </div>
            ) : totalResults === 0 ? (
              <div className="py-10 text-center">
                <Search size={28} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">
                  Sin resultados para "{query}"
                </p>
              </div>
            ) : (
              <>
                {/* Clientes */}
                {results.clients.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                      <User size={10} /> Clientes
                    </p>
                    {results.clients.map((client) => {
                      const user = client.user || client;
                      const imgUrl = getProfileImageUrl(client) || getProfileImageUrl(user);
                      return (
                        <button
                          key={client.id}
                          onClick={() =>
                            handleSelect(`/admin/client-detail/${client.id}`)
                          }
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition group text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/20 overflow-hidden flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={user?.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (user?.name?.[0] || "C").toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white group-hover:text-[#8C7E97] transition truncate">
                              {user?.name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email || "Sin correo"}
                            </p>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 flex-shrink-0 uppercase">
                            Cliente
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Técnicos */}
                {results.technicians.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                      <Wrench size={10} /> Técnicos
                    </p>
                    {results.technicians.map((tech) => {
                      const user = tech.user || tech;
                      const imgUrl = getProfileImageUrl(tech) || getProfileImageUrl(user);
                      return (
                        <button
                          key={tech.id}
                          onClick={() =>
                            handleSelect(`/admin/technician-detail/${tech.id}`)
                          }
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition group text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/20 overflow-hidden flex items-center justify-center text-yellow-400 text-xs font-bold flex-shrink-0">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={user?.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (user?.name?.[0] || "T").toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white group-hover:text-[#8C7E97] transition truncate">
                              {user?.name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email || "Sin correo"}
                            </p>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex-shrink-0 uppercase">
                            Técnico
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {totalResults > 0 && (
            <div className="px-4 py-2 bg-[#262f31] border-t border-white/5">
              <p className="text-[9px] text-gray-600 text-center">
                Presiona Esc para cerrar · Mostrando máx. 5 por categoría
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
