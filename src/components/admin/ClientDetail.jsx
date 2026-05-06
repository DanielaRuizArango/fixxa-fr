import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Clock, 
  FileText, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setLoading(true);
        const response = await fetchData(`/admin/clients/${id}`);
        setClient(response.data);
      } catch (err) {
        setError("No se pudo cargar la información del cliente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [id]);

  if (loading) {
    return (
      <MainLayout roleName="Administrator" profileRoute="/adminProfile">
        <div className="flex flex-col items-center justify-center pt-20">
          <div className="w-12 h-12 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Cargando expediente del cliente...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !client) {
    return (
      <MainLayout roleName="Administrator" profileRoute="/adminProfile">
        <div className="text-center pt-20">
          <p className="text-red-400 mb-4">{error || "Cliente no encontrado."}</p>
          <button onClick={() => navigate("/indexClientAdmin")} className="text-[#8C7E97] hover:underline flex items-center justify-center gap-2 mx-auto">
            <ArrowLeft size={16} /> Volver a la lista
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout roleName="Administrator" profileRoute="/adminProfile">
      <div className="flex flex-col gap-8 pb-20 pt-4">
        
        {/* Botón de regreso */}
        <button
          onClick={() => navigate("/indexClientAdmin")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={20} />
          <span>Regresar a Clientes</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Perfil del Cliente */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#262f31] border border-white/5 rounded-3xl p-8 shadow-xl flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-3xl overflow-hidden mb-6 border-4 border-[#8C7E97]/20 shadow-2xl">
                {client.image ? (
                  <img 
                    src={`${import.meta.env.VITE_API_STORAGE_URL || ''}/${client.image}`} 
                    className="w-full h-full object-cover" 
                    alt={client.name} 
                  />
                ) : (
                  <div className="w-full h-full bg-[#1C2526] flex items-center justify-center text-[#8C7E97]">
                    <User size={64} />
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{client.name}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 ${client.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {client.status === 'active' ? '• Cuenta Activa' : '• Cuenta Bloqueada'}
              </span>

              <div className="w-full space-y-4">
                <InfoRow icon={<Mail size={16} />} label="Correo" value={client.email} />
                <InfoRow icon={<Phone size={16} />} label="Teléfono" value={client.phone || 'No registrado'} />
                <InfoRow icon={<MapPin size={16} />} label="Ubicación" value={`${client.city || ''} ${client.address || ''}`} />
                <InfoRow icon={<Shield size={16} />} label="Documento" value={`${client.type_id || 'ID'}: ${client.id_number || 'N/A'}`} />
                <InfoRow icon={<Calendar size={16} />} label="Miembro desde" value={new Date(client.created_at).toLocaleDateString()} />
              </div>
            </div>
          </div>

          {/* Historial de Casos */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                  <FileText size={22} className="text-[#8C7E97]" />
                  <h2 className="text-2xl font-bold text-white">Casos de Servicio</h2>
               </div>
               <span className="text-xs text-gray-500 font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">
                 {client.client?.service_cases?.length || 0} Casos Totales
               </span>
            </div>

            <div className="flex flex-col gap-4">
              {client.client?.service_cases?.map((caseItem) => (
                <div key={caseItem.id} className="bg-[#262f31] border border-white/5 rounded-2xl p-6 hover:border-[#8C7E97]/30 transition-all group shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold text-[#8C7E97] uppercase tracking-tighter bg-[#8C7E97]/10 px-2 py-0.5 rounded border border-[#8C7E97]/20">
                          #{caseItem.id}
                        </span>
                        <h3 className="font-bold text-white group-hover:text-[#8C7E97] transition-colors">
                          {caseItem.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {caseItem.description}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                         <div className="flex items-center gap-1">
                           <Clock size={12} />
                           {new Date(caseItem.created_at).toLocaleDateString()}
                         </div>
                         <div className="flex items-center gap-1">
                           <MapPin size={12} />
                           {caseItem.location}
                         </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={caseItem.status} />
                      <button 
                        onClick={() => navigate(`/case-detail/${caseItem.id}`)}
                        className="text-xs text-[#8C7E97] hover:underline font-bold"
                      >
                        Ver Detalles →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!client.client?.service_cases || client.client.service_cases.length === 0) && (
                <div className="bg-[#262f31]/50 border border-dashed border-white/5 rounded-3xl p-12 text-center">
                   <AlertCircle size={40} className="mx-auto text-gray-700 mb-4" />
                   <p className="text-gray-500 font-medium">Este cliente no ha solicitado servicios aún.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 text-left p-3 bg-black/20 rounded-2xl border border-white/5">
    <div className="text-[#8C7E97]">
      {icon}
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[9px] uppercase font-bold text-gray-500 leading-tight">{label}</span>
      <span className="text-sm text-gray-200 truncate font-medium">{value}</span>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    responded: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    resolved: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
      {status}
    </span>
  );
};

export default ClientDetail;
