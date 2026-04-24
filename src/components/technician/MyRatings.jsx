import { useState, useEffect } from "react";
import { Star, User, Calendar } from "lucide-react";
import MainLayout from "../templates/MainLayout.jsx";
import { fetchData } from "../../api.js";

const MyRatings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userName = localStorage.getItem("userName") || "Técnico";

  useEffect(() => {
    const loadRatings = async () => {
      try {
        setLoading(true);
        const response = await fetchData("/technician/my-rating");
        setData(response.data);
      } catch (err) {
        console.error("Error al cargar calificaciones:", err);
        setError("No se pudieron cargar tus calificaciones.");
      } finally {
        setLoading(false);
      }
    };

    loadRatings();
  }, []);

  const renderStars = (score) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= score ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
          />
        ))}
      </div>
    );
  };

  return (
    <MainLayout roleName={userName} profileRoute="/technicianProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <h1 className="text-3xl font-bold">Mis Calificaciones</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="w-12 h-12 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Cargando tus calificaciones...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-red-500/10 border border-red-500/50 p-6 text-red-200">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Resumen */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl bg-[#262f31] p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-bold text-white mb-2">{data?.average_score || "0.0"}</span>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      className={star <= Math.round(data?.average_score || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-sm">Promedio de estrellas</p>
              </div>

              <div className="rounded-3xl bg-[#262f31] p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-bold text-white mb-2">{data?.total_ratings || 0}</span>
                <p className="text-gray-400 text-sm">Calificaciones totales</p>
              </div>
            </div>

            {/* Lista de calificaciones */}
            <div className="space-y-4 mt-4">
              <h2 className="text-xl font-semibold px-2">Calificaciones recientes</h2>
              
              {!data?.ratings || data.ratings.length === 0 ? (
                <div className="rounded-3xl bg-[#262f31] p-12 border border-white/5 text-center">
                  <p className="text-gray-400">Aún no tienes calificaciones.</p>
                </div>
              ) : (
                data.ratings.map((rating) => (
                  <div key={rating.id} className="rounded-3xl bg-[#262f31] p-6 border border-white/5 shadow-lg shadow-black/10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#8C7E97]/20 flex items-center justify-center text-[#8C7E97] shrink-0">
                          <User size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{rating.client?.user?.name || "Cliente Anónimo"}</p>
                          <div className="mt-1">{renderStars(rating.score)}</div>
                          {rating.comment && (
                            <p className="mt-4 text-gray-200 italic text-sm leading-relaxed">
                              "{rating.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                        <Calendar size={14} />
                        {new Date(rating.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default MyRatings;
