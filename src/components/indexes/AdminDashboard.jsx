import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Wrench, 
  CheckCircle2, 
  Activity, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText
} from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetchData('/admin/dashboard/metrics');
        setMetrics(response.data);
      } catch (err) {
        setError("Error al cargar las métricas del sistema.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <MainLayout roleName="Administrator" profileRoute="/adminProfile">
        <div className="flex flex-col items-center justify-center pt-20">
          <div className="w-12 h-12 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Generando reporte de sistema...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout roleName="Administrator" profileRoute="/adminProfile">
      <div className="flex flex-col gap-8 pb-20 pt-4">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Kadwa']">Dashboard de Control</h1>
            <p className="text-gray-400">Resumen operativo de la plataforma Fixxa</p>
          </div>
          <div className="bg-[#1C2526] px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-gray-300 uppercase tracking-tighter">Sistema Operativo</span>
          </div>
        </div>

        {/* Tarjetas de Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <MetricCard 
            title="Casos Activos" 
            value={metrics?.cases?.active} 
            icon={<Activity className="text-blue-400" />} 
            description="Servicios en curso"
            color="blue"
          />
          
          <MetricCard 
            title="Técnicos Online" 
            value={metrics?.technicians?.available} 
            icon={<Wrench className="text-green-400" />} 
            description={`${metrics?.technicians?.total} técnicos totales`}
            color="green"
          />

          <MetricCard 
            title="Servicios Éxitosos" 
            value={metrics?.completed_services} 
            icon={<CheckCircle2 className="text-purple-400" />} 
            description="Total histórico"
            color="purple"
          />

          <MetricCard 
            title="Usuarios Totales" 
            value={metrics?.total_users} 
            icon={<Users className="text-orange-400" />} 
            description="Clientes y técnicos"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Logs de Auditoría Recientes */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                  <ShieldAlert size={20} className="text-[#8C7E97]" />
                  <h2 className="text-xl font-bold">Actividad Reciente</h2>
               </div>
               <span className="text-xs text-gray-500 font-medium">Últimas 10 acciones</span>
            </div>
            
            <div className="bg-[#262f31] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                      <th className="px-6 py-4">Administrador</th>
                      <th className="px-6 py-4">Acción</th>
                      <th className="px-6 py-4">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {metrics?.recent_logs?.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#8C7E97]/20 flex items-center justify-center text-[10px] font-bold text-[#8C7E97]">
                              {log.admin?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{log.admin?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-200">{log.description}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                             <Clock size={12} />
                             {new Date(log.created_at).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!metrics?.recent_logs || metrics.recent_logs.length === 0) && (
                      <tr>
                        <td colSpan="3" className="px-6 py-10 text-center text-gray-500 text-sm">
                          No hay registros de auditoría aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Clientes Recientes */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
               <TrendingUp size={20} className="text-[#8C7E97]" />
               <h2 className="text-xl font-bold">Nuevos Clientes</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              {metrics?.recent_clients?.map((client) => (
                <div key={client.id} className="bg-[#262f31] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-[#8C7E97]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8C7E97]/20 to-transparent flex items-center justify-center text-[#8C7E97] font-bold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold truncate w-32">{client.name}</span>
                      <span className="text-[10px] text-gray-500">{new Date(client.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/indexClientAdmin')}
                    className="p-2 rounded-xl bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-[#8C7E97]/20 transition-all"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/indexClientAdmin')}
              className="mt-2 w-full py-3 rounded-2xl border border-dashed border-white/10 text-xs font-bold text-gray-500 hover:text-white hover:border-[#8C7E97]/50 transition-all flex items-center justify-center gap-2"
            >
              <Users size={14} /> Ver todos los clientes
            </button>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

const MetricCard = ({ title, value, icon, description, color }) => {
  const colors = {
    blue: "from-blue-500/20 to-transparent border-blue-500/20",
    green: "from-green-500/20 to-transparent border-green-500/20",
    purple: "from-purple-500/20 to-transparent border-purple-500/20",
    orange: "from-orange-500/20 to-transparent border-orange-500/20",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} bg-[#262f31] border rounded-3xl p-6 shadow-lg hover:translate-y-[-4px] transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-2xl">
          {icon}
        </div>
        <BarChart3 size={16} className="text-gray-600" />
      </div>
      <h3 className="text-4xl font-bold text-white mb-1">{value || 0}</h3>
      <p className="text-gray-300 text-sm font-bold">{title}</p>
      <p className="text-gray-500 text-[10px] mt-1 font-medium uppercase tracking-wider">{description}</p>
    </div>
  );
};

export default AdminDashboard;
