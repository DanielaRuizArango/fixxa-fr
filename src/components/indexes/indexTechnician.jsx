import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";
import { useState, useEffect } from "react";

const IndexTechnical = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Technical");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Cargar nombre del usuario
        const userResponse = await fetchData('/technician/me');
        setUserName(userResponse.data?.name || "Technical");
        
        // Cargar solicitudes activas
        const casesResponse = await fetchData('/technician/cases');
        setCases(casesResponse.data || []);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar las solicitudes.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default: return 'bg-[#1C2526] text-[#c8d2d4] border-[#3f4b4d]';
    }
  };

  return (
    <MainLayout roleName={localStorage.getItem('userName') || userName} profileRoute="/technicianProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">
        
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold font-['Kadwa']">Solicitudes Activas</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Obteniendo solicitudes...</p>
          </div>
        ) : error ? (
          <div className="text-center pt-20">
            <p className="text-red-400 mb-4">{error}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center pt-20">
            <p className="text-gray-400">No hay solicitudes activas en este momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-[#8C7E97] rounded-xl px-6 py-5 hover:bg-[#9d8fa8] transition cursor-pointer shadow-lg shadow-black/10"
                onClick={() => navigate(`/case-detail/${caseItem.id}`)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-base md:text-lg font-semibold text-white truncate">
                        {caseItem.title || caseItem.name || 'Nombre de caso'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] border ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status || 'pending'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div />
                    <p className="text-sm text-white/90 font-semibold">
                      {caseItem.id ? `FTS-${caseItem.id}` : 'FTS-000000'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div />
                    <p className="text-sm text-gray-200">
                      {caseItem.location || caseItem.city || 'No especificado'}
                    </p>
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