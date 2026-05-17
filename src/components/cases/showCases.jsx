import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquare, DollarSign, Clock, User, CheckCircle, Star, X, MapPin, XCircle, ZoomIn, Edit3 } from "lucide-react";
import MainLayout from "../templates/MainLayout.jsx";
import { fetchData, getStorageUrl } from "../../api.js";
import Swal from "sweetalert2";

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
  const [isEditing, setIsEditing] = useState(false);

  // Estados para calificación
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
      Swal.fire({
        icon: "success",
        title: "Propuesta enviada",
        text: "Tu propuesta ha sido enviada correctamente.",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
        timer: 3000,
        timerProgressBar: true,
      });
      setSuccessMessage("Tu propuesta ha sido enviada correctamente.");
      setEstimatedCost("");
      setQuestions("");
      loadCase();
    } catch (err) {
      console.error("Error enviando respuesta:", err);
      const msg = err.message || "No se pudo enviar la propuesta.";
      setError(msg);
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#1C2526", color: "#fff", confirmButtonColor: "#8C7E97" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProposal = async () => {
    setActionLoading(true);
    setError(null);

    try {
      const myTechnicianId = parseInt(localStorage.getItem("technicianId"));
      const myProposal = Array.isArray(caseData?.responses)
        ? caseData.responses.find(r => r.technician_id === myTechnicianId)
        : null;

      if (!myProposal) throw new Error("No se encontró tu propuesta original.");

      await fetchData(`/technician/responses/${myProposal.id}`, {
        method: "PUT",
        body: JSON.stringify({
          estimated_cost: estimatedCost,
          questions: questions
        })
      });

      Swal.fire({
        icon: "success",
        title: "Propuesta actualizada",
        text: "Tu propuesta ha sido modificada correctamente.",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
        timer: 3000,
        timerProgressBar: true,
      });

      setIsEditing(false);
      loadCase();
    } catch (err) {
      console.error("Error al actualizar propuesta:", err);
      const msg = err.message || "No se pudo actualizar la propuesta.";
      setError(msg);
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#1C2526", color: "#fff", confirmButtonColor: "#8C7E97" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptProposal = async (responseId, techId, initialMessage = "") => {
    const result = await Swal.fire({
      icon: "question",
      title: "Aceptar propuesta",
      text: "¿Estás seguro de que deseas aceptar esta propuesta? Se abrirá el chat con el técnico.",
      showCancelButton: true,
      confirmButtonText: "Sí, aceptar",
      cancelButtonText: "Cancelar",
      background: "#1C2526",
      color: "#ffffff",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#4C5462",
    });
    if (!result.isConfirmed) return;

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
      Swal.fire({
        icon: "success",
        title: "¡Propuesta aceptada!",
        text: "Serás redirigido al chat con el técnico.",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      // Buscar el ID del chat en múltiples lugares posibles de la respuesta
      const chatId = response.data?.conversation_id || 
                     response.data?.chat_id || 
                     response.data?.conversation?.id || 
                     response.data?.id || 
                     response.conversation_id || 
                     response.chat_id ||
                     response.id;

      if (chatId) {
        // Redirigir al chat con el técnico después de aceptar
        setTimeout(() => {
          navigate(`/chat/${chatId}`);
        }, 2100);
      } else {
        console.error("No se encontró el ID de la conversación en la respuesta:", response);
        Swal.fire({
          icon: 'warning',
          title: 'Propuesta aceptada',
          text: 'La propuesta fue aceptada, pero no pudimos redirigirte al chat automáticamente. Por favor, ve a la sección de mensajes.',
          background: "#1C2526",
          color: "#ffffff",
          confirmButtonColor: "#8C7E97",
        });
      }
    } catch (err) {
      console.error("Error al aceptar propuesta:", err);
      const msg = err.message || "No se pudo aceptar la propuesta.";
      setError(msg);
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#1C2526", color: "#fff", confirmButtonColor: "#8C7E97" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProposal = async (responseId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Rechazar propuesta",
      text: "¿Estás seguro de que deseas rechazar esta propuesta? Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
      background: "#1C2526",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#4C5462",
    });
    if (!result.isConfirmed) return;

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
      Swal.fire({
        icon: "info",
        title: "Propuesta rechazada",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al rechazar propuesta:", err);
      const msg = err.message || "No se pudo rechazar la propuesta.";
      setError(msg);
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#1C2526", color: "#fff", confirmButtonColor: "#8C7E97" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveCase = async () => {
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
      Swal.fire({
        icon: "success",
        title: "\u00a1Caso terminado!",
        text: "Ahora puedes calificar al técnico.",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al resolver caso:", err);
      const msg = err.message || "No se pudo resolver el caso.";
      setError(msg);
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#1C2526", color: "#fff", confirmButtonColor: "#8C7E97" });
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

  const myTechnicianId = parseInt(localStorage.getItem("technicianId"));
  const myProposal = role === "technician" && Array.isArray(caseData?.responses)
    ? caseData.responses.find(r => r.technician_id === myTechnicianId)
    : null;
  const canEditMyProposal = myProposal && caseData?.accepted_technician_id !== myTechnicianId && ['active', 'responded'].includes(caseData?.status);

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

          <div className="rounded-3xl bg-[#8C7E97]/10 border border-[#8C7E97]/40 px-6 py-4 text-center flex flex-col items-center justify-center">
            <p className="text-sm text-gray-200">Estado</p>
            <p className="mt-2 inline-flex items-center rounded-full bg-[#1c2526] px-4 py-2 text-sm font-semibold text-white border border-[#8c7e97]/40">
              {(() => {
                const translations = {
                  pending: "Pendiente",
                  active: "Activo",
                  responded: "Respondido",
                  resolved: "Resuelto",
                  cancelled: "Cancelado"
                };
                return translations[status?.toLowerCase()] || status;
              })()}
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
                    {images.map((image, index) => {
                      const imgUrl = getStorageUrl(typeof image === "string" ? image : (image.image_path || image.url));
                      return (
                        <div 
                          key={index}
                          onClick={() => setSelectedImage(imgUrl)}
                          className="relative h-32 w-full rounded-2xl overflow-hidden group cursor-pointer border border-white/5"
                          title="Haz clic para ampliar la imagen"
                        >
                          <img
                            src={imgUrl}
                            alt={`Caso ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                            <ZoomIn size={24} className="text-white scale-75 group-hover:scale-100 transition-all duration-300" />
                          </div>
                        </div>
                      );
                    })}
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
                myProposal && !isEditing ? (
                  // MOSTRAR PROPUESTA ENVIADA
                  <div className="rounded-3xl bg-[#262f31] p-6 border border-white/5 shadow-lg shadow-black/10">
                    <h3 className="text-xl font-semibold text-white font-['Kadwa']">Tu Propuesta Enviada</h3>
                    <p className="mt-2 text-xs text-gray-400">
                      Ya has enviado una propuesta para esta solicitud de servicio.
                    </p>
                    
                    <div className="mt-6 bg-[#1c2526] rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-white mb-2">
                        <DollarSign size={16} className="text-green-400" />
                        <span>Costo Estimado: <span className="text-green-400">${parseFloat(myProposal.estimated_cost).toLocaleString()}</span></span>
                      </div>
                      {myProposal.questions && (
                        <p className="text-xs text-gray-300 italic mt-2 border-t border-white/5 pt-2">
                          "{myProposal.questions}"
                        </p>
                      )}
                    </div>

                    <div className="mt-6 space-y-3">
                      {/* Botón para iniciar conversación, solo si es el técnico aceptado */}
                      {caseData?.accepted_technician_id === myTechnicianId && (
                        <button
                          onClick={() => handleStartChat()}
                          className="w-full rounded-2xl bg-green-600 hover:bg-green-500 active:scale-95 px-5 py-3 text-sm font-bold text-white shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                          <MessageSquare size={16} />
                          Chat con el Cliente
                        </button>
                      )}

                      {/* Botón para editar propuesta */}
                      {canEditMyProposal && (
                        <button
                          onClick={() => {
                            setEstimatedCost(myProposal.estimated_cost);
                            setQuestions(myProposal.questions || "");
                            setIsEditing(true);
                          }}
                          className="w-full rounded-2xl bg-[#8C7E97]/25 hover:bg-[#8C7E97]/40 border border-[#8C7E97]/30 hover:border-[#8C7E97]/50 active:scale-95 px-5 py-3 text-sm font-bold text-[#d7c4ff] hover:text-white shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                          <Edit3 size={16} />
                          Editar Propuesta
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // FORMULARIO DE ENVIAR O EDITAR PROPUESTA
                  <div className="rounded-3xl bg-[#262f31] p-6 border border-white/5 shadow-lg shadow-black/10">
                    <h3 className="text-xl font-semibold text-white font-['Kadwa']">
                      {isEditing ? "Editar Propuesta" : "Enviar Propuesta"}
                    </h3>
                    <p className="mt-2 text-sm text-gray-300">
                      {isEditing ? "Modifica el costo estimado y tu mensaje para el cliente." : "Proporciona un costo estimado y un comentario para el cliente."}
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

                    <div className="mt-6 flex flex-col gap-2">
                      <button
                        onClick={isEditing ? handleEditProposal : handleInterest}
                        disabled={actionLoading || !estimatedCost}
                        className="w-full rounded-2xl bg-[#8C7E97] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8C7E97]/20 transition hover:bg-[#a493bd] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            <span>{isEditing ? "Guardar Cambios" : "Enviar Propuesta"}</span>
                          </>
                        )}
                      </button>

                      {isEditing && (
                        <button
                          onClick={() => setIsEditing(false)}
                          className="w-full rounded-2xl bg-[#4c5462]/30 hover:bg-[#4c5462]/50 text-gray-300 px-5 py-3 text-sm font-semibold transition active:scale-95 uppercase tracking-wider"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>

                    {successMessage && !isEditing && (
                      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                        <p className="text-sm font-bold text-emerald-300">{successMessage}</p>
                      </div>
                    )}
                  </div>
                )
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

                        const ratingScore = tech?.technician?.average_rating || tech?.average_rating || 0;
                        const ratingCount = tech?.technician?.ratings_count || tech?.ratings_count || 0;
                        
                        return (
                          <div key={tech?.id || index} className={`rounded-3xl bg-[#1c2526] overflow-hidden border ${isAccepted ? 'border-emerald-500/40 shadow-inner' : 'border-white/5'} shadow-md transition-all duration-300`}>
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div 
                                      onClick={() => navigate(`/technician-profile/${techId}`)}
                                      className="w-10 h-10 rounded-full bg-[#8C7E97]/20 flex items-center justify-center text-[#8C7E97] shrink-0 cursor-pointer hover:bg-[#8C7E97]/30 transition-colors"
                                    >
                                      <User size={20} />
                                    </div>
                                    <span 
                                      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-[#1c2526] ${
                                        (tech?.technician?.user?.is_online || tech?.user?.is_online || tech?.is_online)
                                          ? "bg-emerald-400 animate-pulse"
                                          : "bg-gray-500"
                                      }`}
                                      title={
                                        (tech?.technician?.user?.is_online || tech?.user?.is_online || tech?.is_online)
                                          ? "En línea"
                                          : "Desconectado"
                                      }
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p 
                                        onClick={() => navigate(`/technician-profile/${techId}`)}
                                        className="font-bold text-white text-base leading-tight cursor-pointer hover:text-[#8C7E97] transition-colors"
                                      >
                                        {techName}
                                      </p>
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                        (tech?.technician?.user?.is_online || tech?.user?.is_online || tech?.is_online)
                                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                          : "bg-gray-500/10 text-gray-400 border border-white/5"
                                      }`}>
                                        {(tech?.technician?.user?.is_online || tech?.user?.is_online || tech?.is_online)
                                          ? "En línea"
                                          : "Desconectado"}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{techEmail}</p>

                                    {/* Calificación y Estrellas del Técnico (Solo si tiene calificaciones) */}
                                    {ratingCount > 0 && (
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <div className="flex items-center gap-0.5">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              size={11}
                                              className={`${star <= Math.round(ratingScore) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">
                                          {ratingScore.toFixed(1)} ({ratingCount})
                                        </span>
                                      </div>
                                    )}

                                    {/* Botón Ver Perfil debajo de la calificación */}
                                    <button
                                      onClick={() => navigate(`/technician-profile/${techId}`)}
                                      className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8C7E97]/15 hover:bg-[#8C7E97]/30 border border-[#8C7E97]/30 hover:border-[#8C7E97]/50 text-[#d7c4ff] hover:text-white text-[11px] font-bold transition-all shadow-md w-fit"
                                      title="Ver perfil completo del técnico"
                                    >
                                      <User size={13} />
                                      <span>Ver Perfil</span>
                                    </button>

                                    {isAccepted && (
                                      <span className="mt-2 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit uppercase tracking-tighter">
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
                                
                                <div className="flex items-center gap-2">
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

      </div>

      {/* Lightbox Modal de Imagen Ampliada con Lupa */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer"
          >
            <X size={24} />
          </button>
          <div 
            className="relative max-w-[90vw] max-h-[90vh] p-2 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="Visualización ampliada" 
              className="max-w-full max-h-[85vh] rounded-3xl object-contain border border-white/10 shadow-2xl transition-all duration-300"
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CaseDetail;
