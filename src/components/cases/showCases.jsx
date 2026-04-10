import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquare, DollarSign, Clock, User, CheckCircle } from "lucide-react";
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
  const [estimatedCost, setEstimatedCost] = useState("");
  const [questions, setQuestions] = useState("");

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
    setError(null);

    try {
      // Usamos el endpoint correcto según el api.php y el controlador CaseResponseController
      const endpoint = `/technician/responses`;
      await fetchData(endpoint, {
        method: "POST",
        body: JSON.stringify({
          service_case_id: id,
          estimated_cost: estimatedCost,
          questions: questions
        })
      });
      setSuccessMessage("Tu propuesta ha sido enviada correctamente.");
      setEstimatedCost("");
      setQuestions("");
      
      // Recargar los datos del caso
      const response = await fetchData(apiEndpoint);
      const data = response.data || response.case || response;
      setCaseData(data);
    } catch (err) {
      console.error("Error enviando respuesta:", err);
      setError(err.message || "No se pudo enviar la propuesta.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = async (targetTechnicianId = null) => {
    setActionLoading(true);
    try {
      const response = await fetchData("/chat/start", {
        method: "POST",
        body: JSON.stringify({
          service_case_id: id,
          technician_id: targetTechnicianId || localStorage.getItem("technicianId"),
        }),
      });
      navigate(`/chat/${response.data.id}`);
    } catch (err) {
      console.error("Error al iniciar chat:", err);
      setError("No se pudo iniciar el chat.");
    } finally {
      setActionLoading(false);
    }
  };

  const interestedTechnicians = [
    ...(Array.isArray(caseData?.responses) ? caseData.responses.map(r => ({ ...r, isResponse: true })) : []),
    ...(Array.isArray(caseData?.interested_technicians) ? caseData.interested_technicians : []),
    ...(Array.isArray(caseData?.interestedTechnicians) ? caseData.interestedTechnicians : []),
    ...(Array.isArray(caseData?.interested) ? caseData.interested : []),
    ...(Array.isArray(caseData?.technicians) ? caseData.technicians : []),
    ...(Array.isArray(caseData?.offers) ? caseData.offers : [])
  ];

  // Eliminar duplicados si un técnico aparece en varias listas
  const uniqueTechnicians = Array.from(new Map(interestedTechnicians.map(item => [item?.technician_id || item?.id || Math.random(), item])).values());

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
            <p className="text-sm text-gray-300 mt-2">Número: {caseNumber} • {caseData?.client?.city || location}</p>
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
                  <h3 className="text-xl font-semibold text-white">Enviar Propuesta</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Proporciona un costo estimado y un comentario para el cliente.
                  </p>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Costo Estimado ($)</label>
                      <input 
                        type="number" 
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        placeholder="Ej: 50000"
                        className="w-full bg-[#1c2526] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-[#8C7E97] outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tu Mensaje/Preguntas</label>
                      <textarea 
                        value={questions}
                        onChange={(e) => setQuestions(e.target.value)}
                        placeholder="Explica tu propuesta o haz preguntas..."
                        rows={3}
                        className="w-full bg-[#1c2526] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-[#8C7E97] outline-none transition resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleInterest}
                    disabled={actionLoading || !estimatedCost}
                    className="mt-6 w-full rounded-2xl bg-[#8C7E97] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8C7E97]/20 transition hover:bg-[#a493bd] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {actionLoading ? "Enviando..." : (
                      <>
                        <CheckCircle size={18} />
                        Enviar Propuesta
                      </>
                    )}
                  </button>

                  {successMessage && (
                    <p className="mt-4 text-sm text-emerald-300">{successMessage}</p>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl bg-[#2f343b] p-6 border border-white/10 shadow-lg shadow-black/10">
                  <h3 className="text-xl font-semibold text-white">Técnicos interesados</h3>
                  <p className="mt-2 text-sm text-gray-300">A continuación ves la lista de técnicos que han mostrado interés.</p>

                  {!uniqueTechnicians || uniqueTechnicians.length === 0 ? (
                    <div className="mt-6 rounded-3xl bg-[#1c2526] p-4 text-sm text-center text-gray-400 border border-white/5">
                      No hay propuestas aún.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {uniqueTechnicians.map((tech, index) => {
                        const isProposal = tech.isResponse;
                        const techName = tech?.technician?.user?.name || tech?.name || tech?.full_name || tech?.user?.name || `Técnico #${index + 1}`;
                        const techEmail = tech?.technician?.user?.email || tech?.email || tech?.user?.email || "Sin correo";
                        
                        return (
                          <div key={tech?.id || index} className="rounded-3xl bg-[#1c2526] overflow-hidden border border-white/10 shadow-md">
                            <div className="p-5">
                              <div className="flex items-center justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#8C7E97]/20 flex items-center justify-center text-[#8C7E97]">
                                    <User size={20} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-base">{techName}</p>
                                    <p className="text-xs text-gray-400">{techEmail}</p>
                                  </div>
                                </div>
                                
                                {isProposal ? (
                                  <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                    <DollarSign size={14} className="text-emerald-400" />
                                    <span className="text-emerald-400 font-bold text-sm">
                                      ${parseInt(tech.estimated_cost).toLocaleString()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider bg-gray-500/10 px-2 py-1 rounded-md">
                                    Interesado
                                  </span>
                                )}
                              </div>

                              {isProposal && tech.questions && (
                                <div className="mt-3 bg-white/5 rounded-2xl p-4 text-sm text-gray-200 border border-white/5 italic">
                                  "{tech.questions}"
                                </div>
                              )}

                              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                  <Clock size={12} />
                                  {tech.created_at ? new Date(tech.created_at).toLocaleDateString() : 'Reciente'}
                                </div>
                                
                                <button
                                  onClick={() => handleStartChat(tech.technician_id || tech.id)}
                                  className="flex items-center gap-2 bg-[#8C7E97] px-4 py-2 rounded-xl text-white text-xs font-bold hover:bg-[#a493bd] transition shadow-lg shadow-black/20"
                                >
                                  <MessageSquare size={14} />
                                  Contactar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
