import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquare, DollarSign, Clock, User, CheckCircle, Star, X, MapPin } from "lucide-react";
import MainLayout from "../templates/MainLayout.jsx";
import { fetchData, getStorageUrl } from "../../api.js";

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

  // Estados para calificación
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  const role = localStorage.getItem("role");
  const isAdmin = ["super_admin", "admin", "moderator"].includes(role);
  const userName = localStorage.getItem("userName") || "Usuario";
  
  let apiEndpoint = `/client/cases/${id}`;
  if (role === "technician") {
    apiEndpoint = `/technician/cases/${id}`;
  } else if (isAdmin) {
    apiEndpoint = `/admin/cases/${id}`;
  }

  const loadCase = async () => {
    try {
      setLoading(true);
      const response = await fetchData(apiEndpoint);
      const data = response.data || response.case || response;
      setCaseData(data);
    } catch (err) {
      console.error("Error al cargar el caso:", err);
      setError(err.message || "No se pudo cargar el caso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [apiEndpoint]);

  const handleInterest = async () => {
    setActionLoading(true);
    setSuccessMessage("");
    setError(null);

    try {
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
      loadCase();
    } catch (err) {
      console.error("Error enviando respuesta:", err);
      setError(err.message || "No se pudo enviar la propuesta.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptProposal = async (responseId, techId, initialMessage = "") => {
    setActionLoading(true);
    setError(null);
    try {
      const response = await fetchData(`/client/cases/${id}/proposals/${responseId}/accept`, {
        method: "POST",
        body: JSON.stringify({
          initial_message: initialMessage
        })
      });
      setSuccessMessage("Propuesta aceptada correctamente.");
      setCaseData(response.data);
      
      // Redirigir al chat con el técnico después de aceptar
      setTimeout(() => {
        navigate(`/chat/${response.data.conversation_id || response.data.chat_id}`);
      }, 500);
    } catch (err) {
      console.error("Error al aceptar propuesta:", err);
      setError(err.message || "No se pudo aceptar la propuesta.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProposal = async (responseId) => {
    setActionLoading(true);
    setError(null);
    try {
      await fetchData(`/client/cases/${id}/proposals/${responseId}/reject`, {
        method: "DELETE"
      });
      setSuccessMessage("Propuesta rechazada.");
      setCaseData(prev => ({
        ...prev,
        responses: prev.responses.filter(r => r.id !== responseId)
      }));
    } catch (err) {
      console.error("Error al rechazar propuesta:", err);
      setError(err.message || "No se pudo rechazar la propuesta.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveCase = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const response = await fetchData(`/client/cases/${id}/resolve`, {
        method: "PATCH"
      });
      setSuccessMessage("Caso marcado como resuelto.");
      setScore(0);
      setComment("");
      setCaseData(response.data);
    } catch (err) {
      console.error("Error al resolver caso:", err);
      setError(err.message || "No se pudo resolver el caso.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (score === 0) {
      setError("Por favor selecciona una puntuación.");
      return;
    }

    setRatingLoading(true);
    setError(null);
    try {
      const response = await fetchData(`/client/ratings`, {
        method: "POST",
        body: JSON.stringify({
          service_case_id: id,
          score,
          comment
        })
      });
      setSuccessMessage("¡Gracias por tu calificación!");
      setCaseData(prev => ({
        ...prev,
        rating: response.data
      }));
    } catch (err) {
      console.error("Error al enviar calificación:", err);
      setError(err.message || "No se pudo enviar la calificación.");
    } finally {
      setRatingLoading(false);
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

  const uniqueTechnicians = Array.from(new Map(interestedTechnicians.map(item => [item?.technician_id || item?.id || Math.random(), item])).values());

  const images = caseData?.images || caseData?.photos || [];
  const status = caseData?.status || caseData?.state || "pending";
  const caseNumber = caseData?.id ? `FTS-${caseData.id}` : "FTS-000000";
  const location = caseData?.location || caseData?.city || "No especificado";
  const serviceType = caseData?.service_type === 'remote' ? 'Remota' : 'Presencial';
  const title = caseData?.title || caseData?.name || "Caso sin título";
  const description = caseData?.description || "Sin descripción disponible.";

  return (
    <MainLayout
      roleName={userName}
      profileRoute={role === "technician" ? "/technicianProfile" : isAdmin ? "/adminProfile" : "/customerProfile"}
    >
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => {
                if (role === "technician") navigate("/indexTechnician");
                else if (isAdmin) navigate("/indexCasesAdmin");
                else navigate("/indexCustomer");
              }}
              className="text-sm text-[#8C7E97] hover:underline"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold mt-4">Detalle del Caso</h1>
            <p className="text-sm text-gray-300 mt-2">
              Número: {caseNumber} • {caseData?.client?.user?.city || location} • <span className={caseData?.service_type === 'remote' ? 'text-blue-400' : 'text-orange-400'}>{serviceType}</span>
            </p>
            {isAdmin && caseData?.client && (
              <button 
                onClick={() => navigate(`/admin/client-detail/${caseData.client.id}`)}
                className="mt-2 text-xs font-bold text-[#8C7E97] hover:text-[#a493bd] flex items-center gap-1 transition-colors"
              >
                <User size={14} />
                Ver expediente del cliente: {caseData.client.user?.name}
              </button>
            )}
          </div>

          <div className="rounded-3xl bg-[#8C7E97]/10 border border-[#8C7E97]/40 px-5 py-4 text-right">
            <p className="text-sm text-gray-200">Estado</p>
            <p className="mt-2 inline-flex items-center rounded-full bg-[#1c2526] px-4 py-2 text-sm font-semibold text-white border border-[#8c7e97]/40">
              {status}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
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
              <div className="rounded-3xl bg-[#2b2f36] p-6 border border-white/5 shadow-lg shadow-black/10">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{title}</h2>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-sm text-gray-300">Ubicación: {location}</p>
                      {caseData?.latitude && caseData?.longitude && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${caseData.latitude},${caseData.longitude}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-[#8C7E97] hover:underline flex items-center gap-1 mt-1"
                        >
                          <MapPin size={12} />
                          Ver ubicación exacta en Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex rounded-full bg-[#8C7E97]/15 px-4 py-2 text-sm font-semibold text-[#d7c4ff] border border-[#8C7E97]/30">
                    {caseNumber}
                  </span>
                </div>
                <div className="mt-6 text-gray-200 leading-7">{description}</div>
              </div>

              {images.length > 0 && (
                <div className="rounded-3xl bg-[#2b2f36] p-4 border border-white/5 shadow-lg shadow-black/10">
                  <h3 className="text-lg font-semibold mb-4 text-white font-['Kadwa']">Imágenes del caso</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={getStorageUrl(typeof image === "string" ? image : (image.image_path || image.url))}
                        alt={`Caso ${index + 1}`}
                        className="h-32 w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Panel de Calificación o Agradecimiento */}
              {role === "client" && status === 'resolved' && (
                <div className="mt-6">
                  {!caseData.rating ? (
                    <div className="rounded-3xl bg-[#262f31] p-8 border border-white/5 shadow-xl space-y-6">
                      <h3 className="text-2xl font-bold text-white font-['Kadwa'] text-center">¿Cómo fue el servicio?</h3>
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              onClick={() => setScore(star)}
                              className="transition-transform hover:scale-110 active:scale-95"
                            >
                              <Star
                                size={44}
                                className={`
                                  ${(hoveredStar || score) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                                  transition-colors duration-200
                                `}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                          {score === 0 ? "Haz clic para calificar" : `Has seleccionado: ${score} estrellas`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Comentario (opcional)</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Cuéntanos tu experiencia con el técnico..."
                          rows={4}
                          className="w-full bg-[#1c2526] border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#8C7E97] outline-none transition resize-none placeholder:text-gray-600 shadow-inner"
                        ></textarea>
                      </div>

                      <button
                        onClick={handleSubmitRating}
                        disabled={ratingLoading || score === 0}
                        className="w-full rounded-2xl bg-[#8C7E97] px-6 py-4 text-sm font-bold text-white shadow-xl shadow-[#8C7E97]/20 transition hover:bg-[#a493bd] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest"
                      >
                        {ratingLoading ? (
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : "Enviar calificación"}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-[#8C7E97]/10 border border-[#8C7E97]/30 p-10 text-center flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-6 border border-green-500/20 shadow-lg shadow-green-500/10">
                        <CheckCircle size={40} />
                      </div>
                      <h3 className="text-3xl font-bold text-white font-['Kadwa']">¡Gracias por tu calificación!</h3>
                      <div className="flex gap-2 mt-6 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={28}
                            className={star <= caseData.rating.score ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}
                          />
                        ))}
                      </div>
                      {caseData.rating.comment && (
                        <p className="text-gray-200 mt-2 italic text-xl leading-relaxed opacity-90 max-w-lg bg-black/20 p-6 rounded-2xl border border-white/5">
                          "{caseData.rating.comment}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {role === "technician" ? (
                <div className="rounded-3xl bg-[#262f31] p-6 border border-white/5 shadow-lg shadow-black/10">
                  <h3 className="text-xl font-semibold text-white font-['Kadwa']">Enviar Propuesta</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Proporciona un costo estimado y un comentario para el cliente.
                  </p>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Costo Estimado ($)</label>
                      <input 
                        type="number" 
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        placeholder="Ej: 50000"
                        className="w-full bg-[#1c2526] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-[#8C7E97] outline-none transition shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Tu Mensaje/Preguntas</label>
                      <textarea 
                        value={questions}
                        onChange={(e) => setQuestions(e.target.value)}
                        placeholder="Explica tu propuesta o haz preguntas..."
                        rows={3}
                        className="w-full bg-[#1c2526] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-[#8C7E97] outline-none transition resize-none shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleInterest}
                    disabled={actionLoading || !estimatedCost}
                    className="mt-6 w-full rounded-2xl bg-[#8C7E97] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8C7E97]/20 transition hover:bg-[#a493bd] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Enviar Propuesta
                      </>
                    )}
                  </button>

                  {successMessage && (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                      <p className="text-sm font-bold text-emerald-300">{successMessage}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl bg-[#262f31] p-6 border border-white/5 shadow-lg shadow-black/10">
                  <h3 className="text-xl font-semibold text-white font-['Kadwa']">Propuestas de Técnicos</h3>
                  <p className="mt-2 text-sm text-gray-300">Revisa las ofertas de los técnicos interesados.</p>

                  {!uniqueTechnicians || uniqueTechnicians.length === 0 ? (
                    <div className="mt-6 rounded-3xl bg-[#1c2526] p-10 text-sm text-center text-gray-400 border border-white/5 italic">
                      No hay propuestas aún.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {uniqueTechnicians.map((tech, index) => {
                        const isProposal = tech.isResponse;
                        const techId = tech?.technician_id || tech?.id;
                        const techName = tech?.technician?.user?.name || tech?.name || tech?.full_name || tech?.user?.name || `Técnico #${index + 1}`;
                        const techEmail = tech?.technician?.user?.email || tech?.email || tech?.user?.email || "Sin correo";
                        const isAccepted = caseData?.accepted_technician_id === techId;
                        
                        return (
                          <div key={tech?.id || index} className={`rounded-3xl bg-[#1c2526] overflow-hidden border ${isAccepted ? 'border-emerald-500/40 shadow-inner' : 'border-white/5'} shadow-md transition-all duration-300`}>
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                  <div 
                                    onClick={() => navigate(`/technician-profile/${techId}`)}
                                    className="w-10 h-10 rounded-full bg-[#8C7E97]/20 flex items-center justify-center text-[#8C7E97] shrink-0 cursor-pointer hover:bg-[#8C7E97]/30 transition-colors"
                                  >
                                    <User size={20} />
                                  </div>
                                  <div>
                                    <p 
                                      onClick={() => navigate(`/technician-profile/${techId}`)}
                                      className="font-bold text-white text-base leading-tight cursor-pointer hover:text-[#8C7E97] transition-colors"
                                    >
                                      {techName}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{techEmail}</p>
                                    {isAccepted && (
                                      <span className="mt-1.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit uppercase tracking-tighter">
                                        <CheckCircle size={10} />
                                        Técnico aceptado
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {isProposal ? (
                                  <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0">
                                    <DollarSign size={14} className="text-emerald-400" />
                                    <span className="text-emerald-400 font-bold text-sm">
                                      {parseInt(tech.estimated_cost).toLocaleString()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider bg-gray-500/10 px-2 py-1 rounded-md shrink-0 border border-white/5">
                                    Interesado
                                  </span>
                                )}
                              </div>

                              {isProposal && tech.questions && (
                                <div className="mt-3 bg-white/5 rounded-2xl p-4 text-xs text-gray-200 border border-white/5 italic leading-relaxed">
                                  "{tech.questions}"
                                </div>
                              )}

                              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                  <Clock size={12} />
                                  {tech.created_at ? new Date(tech.created_at).toLocaleDateString() : 'Reciente'}
                                </div>
                                
                                <div className="flex gap-2">
                                  {role === "client" && isProposal && !['pending', 'resolved', 'cancelled'].includes(status) && !isAccepted && (
                                    <>
                                      <button
                                        onClick={() => handleAcceptProposal(tech.id, techId, tech.questions)}
                                        disabled={actionLoading}
                                        className="flex items-center justify-center p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                                        title="Aceptar propuesta"
                                      >
                                        <CheckCircle size={18} />
                                      </button>
                                      <button
                                        onClick={() => handleRejectProposal(tech.id)}
                                        disabled={actionLoading}
                                        className="flex items-center justify-center p-2 rounded-xl bg-red-600/80 text-white hover:bg-red-700 transition shadow-lg shadow-red-900/20 disabled:opacity-50"
                                        title="Rechazar propuesta"
                                      >
                                        <X size={18} />
                                      </button>
                                    </>
                                  )}
                                  {isAccepted && (
                                    <button
                                      onClick={() => handleStartChat(techId)}
                                      className="flex items-center gap-2 bg-[#8C7E97] px-4 py-2 rounded-xl text-white text-[11px] font-bold hover:bg-[#a493bd] transition shadow-lg shadow-black/20 uppercase tracking-widest"
                                    >
                                      <MessageSquare size={14} />
                                      Chat
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {role === "client" && status === 'pending' && (
                        <button
                          onClick={handleResolveCase}
                          disabled={actionLoading}
                          className="w-full mt-2 rounded-2xl bg-[#8C7E97] px-5 py-4 text-sm font-bold text-white shadow-xl shadow-[#8C7E97]/20 transition hover:bg-[#a493bd] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                          {actionLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              Marcar como resuelto
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {successMessage && !['technician', 'client'].includes(localStorage.getItem('role') === 'technician' ? 'client' : '') && (
           <div className="fixed bottom-10 right-10 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-bounce">
              {successMessage}
           </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CaseDetail;
