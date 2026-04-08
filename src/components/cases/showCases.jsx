import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../templates/MainLayout.jsx";
import { fetchData } from "../../api.js";

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "Usuario";
  const apiEndpoint = role === "technician"
    ? `/technician/cases/${id}`
    : `/client/cases/${id}`;

  useEffect(() => {
    const loadCase = async () => {
      try {
        setLoading(true);
        const response = await fetchData(apiEndpoint);
        console.log("Respuesta del caso:", response);
        const data = response.data || response.case || response;
        console.log("Datos extraídos:", data);
        console.log("Técnicos interesados:", data?.interested_technicians || data?.interestedTechnicians || data?.interested || data?.technicians || []);
        setCaseData(data);
      } catch (err) {
        console.error("Error al cargar el caso:", err);
        setError(err.message || "No se pudo cargar el caso.");
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [apiEndpoint]);

  const handleInterest = async () => {
    setActionLoading(true);
    setSuccessMessage("");

    try {
      const endpoint = `/technician/cases/${id}/interest`;
      await fetchData(endpoint, {
        method: "POST",
      });
      setSuccessMessage("Solicitud de interés enviada correctamente.");
    } catch (err) {
      console.error("Error enviando interés:", err);
      setError(err.message || "No se pudo enviar la solicitud de interés.");
    } finally {
      setActionLoading(false);
    }
  };

  const interestedTechnicians = Array.isArray(caseData?.interested_technicians)
    ? caseData.interested_technicians
    : Array.isArray(caseData?.interestedTechnicians)
    ? caseData.interestedTechnicians
    : Array.isArray(caseData?.interested)
    ? caseData.interested
    : Array.isArray(caseData?.technicians)
    ? caseData.technicians
    : Array.isArray(caseData?.offers)
    ? caseData.offers
    : [];

  const images = caseData?.images || caseData?.photos || [];
  const status = caseData?.status || caseData?.state || "pending";
  const caseNumber = caseData?.id ? `FTS-${caseData.id}` : "FTS-000000";
  const location = caseData?.location || caseData?.city || "No especificado";
  const title = caseData?.title || caseData?.name || "Caso sin título";
  const description = caseData?.description || "Sin descripción disponible.";

  return (
    <MainLayout
      roleName={userName}
      profileRoute={role === "technician" ? "/technicianProfile" : "/customerProfile"}
    >
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => navigate(role === "technician" ? "/indexTechnician" : "/indexCustomer")}
              className="text-sm text-[#8C7E97] hover:underline"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold mt-4">Detalle del Caso</h1>
            <p className="text-sm text-gray-300 mt-2">Número: {caseNumber}</p>
          </div>

          <div className="rounded-3xl bg-[#8C7E97]/10 border border-[#8C7E97]/40 px-5 py-4 text-right">
            <p className="text-sm text-gray-200">Estado</p>
            <p className="mt-2 inline-flex items-center rounded-full bg-[#1c2526] px-4 py-2 text-sm font-semibold text-white border border-[#8c7e97]/40">
              {status}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-24">
            <div className="w-12 h-12 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Cargando detalles del caso...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-red-500/10 border border-red-500/30 p-6 text-red-200">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-3xl bg-[#2f343b] p-6 border border-white/10 shadow-lg shadow-black/10">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{title}</h2>
                    <p className="mt-2 text-sm text-gray-300">Ubicación: {location}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-[#8C7E97]/15 px-4 py-2 text-sm font-semibold text-[#d7c4ff] border border-[#8C7E97]/30">
                    {caseNumber}
                  </span>
                </div>
                <div className="mt-6 text-gray-200 leading-7">{description}</div>
              </div>

              {images.length > 0 && (
                <div className="rounded-3xl bg-[#2f343b] p-4 border border-white/10 shadow-lg shadow-black/10">
                  <h3 className="text-lg font-semibold mb-4 text-white">Imágenes del caso</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={typeof image === "string" ? image : image.url}
                        alt={`Caso ${index + 1}`}
                        className="h-32 w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {role === "technician" ? (
                <div className="rounded-3xl bg-[#2f343b] p-6 border border-white/10 shadow-lg shadow-black/10">
                  <h3 className="text-xl font-semibold text-white">Interesarse en el caso</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Envía una solicitud para indicar que te interesa trabajar en este caso.
                  </p>
                  <button
                    onClick={handleInterest}
                    disabled={actionLoading}
                    className="mt-6 w-full rounded-2xl bg-[#8C7E97] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a493bd] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? "Enviando..." : "Mostrar interés"}
                  </button>
                  {successMessage && (
                    <p className="mt-4 text-sm text-emerald-300">{successMessage}</p>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl bg-[#2f343b] p-6 border border-white/10 shadow-lg shadow-black/10">
                  <h3 className="text-xl font-semibold text-white">Técnicos interesados</h3>
                  <p className="mt-2 text-sm text-gray-300">A continuación ves la lista de técnicos que han mostrado interés.</p>

                  {!interestedTechnicians || interestedTechnicians.length === 0 ? (
                    <div className="mt-6 rounded-3xl bg-[#1c2526] p-4 text-sm text-gray-300">
                      No hay técnicos interesados aún.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {Array.isArray(interestedTechnicians) && interestedTechnicians.map((tech, index) => (
                        <div key={tech?.id || index} className="rounded-3xl bg-[#1c2526] p-4 border border-white/10">
                          <p className="font-semibold text-white">
                            {tech?.name || tech?.full_name || tech?.user?.name || `Técnico #${index + 1}`}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {tech?.email || tech?.user?.email || tech?.phone || "Sin datos"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CaseDetail;
