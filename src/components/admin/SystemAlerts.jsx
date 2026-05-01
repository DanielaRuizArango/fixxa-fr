import { useState, useEffect } from "react";
import { AlertTriangle, Clock, Star, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from "lucide-react";
import { fetchData } from "../../api";

const SystemAlerts = () => {
    const [alerts, setAlerts] = useState({ unanswered_cases: [], poor_technicians: [] });
    const [summary, setSummary] = useState({ total_critical_alerts: 0 });
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                setLoading(true);
                const response = await fetchData('/admin/alerts');
                setAlerts(response.data.alerts);
                setSummary(response.data.summary);
            } catch (err) {
                console.error("Error loading system alerts:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAlerts();
        // Refresh every 5 minutes
        const interval = setInterval(loadAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading && summary.total_critical_alerts === 0) return null;
    if (!loading && summary.total_critical_alerts === 0) return (
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-sm text-green-200/80 font-medium">No hay alertas críticas pendientes en el sistema.</span>
        </div>
    );

    const totalAlerts = summary.total_critical_alerts;

    return (
        <div className={`transition-all duration-500 mb-6 ${isExpanded ? 'bg-[#262f31]' : 'bg-red-500/10'} border ${isExpanded ? 'border-white/10' : 'border-red-500/30'} rounded-2xl overflow-hidden shadow-xl`}>
            {/* Header / Summary Bar */}
            <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${totalAlerts > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'} text-white`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Alertas del Sistema</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            {totalAlerts} {totalAlerts === 1 ? 'ALERTA CRÍTICA' : 'ALERTAS CRÍTICAS'} DETECTADAS
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium mr-2">Ver detalles</span>
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 pt-0 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        
                        {/* Column: Unanswered Cases */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Clock size={16} className="text-yellow-500" />
                                <h4 className="text-xs font-bold text-gray-300 uppercase">Casos sin respuesta ({alerts.unanswered_cases.length})</h4>
                            </div>
                            {alerts.unanswered_cases.length === 0 ? (
                                <p className="text-xs text-gray-500 italic px-1">No hay casos demorados.</p>
                            ) : (
                                alerts.unanswered_cases.map(caseItem => (
                                    <div key={caseItem.id} className="bg-black/20 border border-white/5 p-3 rounded-xl hover:border-yellow-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-white line-clamp-1">{caseItem.title}</span>
                                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded font-bold">+{caseItem.hours_waiting}h</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                                            <span>Cliente: {caseItem.client_name}</span>
                                            <button 
                                                className="text-[#8C7E97] hover:underline font-bold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/case-detail/${caseItem.id}`;
                                                }}
                                            >
                                                Gestionar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Column: Poorly Rated Technicians */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Star size={16} className="text-red-500" />
                                <h4 className="text-xs font-bold text-gray-300 uppercase">Calificaciones bajas ({alerts.poor_technicians.length})</h4>
                            </div>
                            {alerts.poor_technicians.length === 0 ? (
                                <p className="text-xs text-gray-500 italic px-1">No hay técnicos bajo el promedio.</p>
                            ) : (
                                alerts.poor_technicians.map(tech => (
                                    <div key={tech.id} className="bg-black/20 border border-white/5 p-3 rounded-xl hover:border-red-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-white truncate">{tech.name}</span>
                                            <div className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold">
                                                <Star size={8} fill="currentColor" /> {tech.average_rating}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                                            <span>{tech.total_ratings} calificaciones totales</span>
                                            <button 
                                                className="text-[#8C7E97] hover:underline font-bold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/indexTechnicianAdmin?search=${tech.name}`;
                                                }}
                                            >
                                                Ver perfil
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemAlerts;
