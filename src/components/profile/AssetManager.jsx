import { useState, useEffect } from "react";
import { fetchData, getStorageUrl } from "../../api";
import { Trash2, Plus, Briefcase, Award, Image as ImageIcon } from "lucide-react";

const AssetManager = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const assetTypes = [
        { id: 'tool', label: 'Herramientas', icon: <Briefcase size={20} /> },
        { id: 'certification', label: 'Certificaciones', icon: <Award size={20} /> },
        { id: 'work', label: 'Trabajos Previos', icon: <ImageIcon size={20} /> }
    ];

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const response = await fetchData('/technician/assets');
            setAssets(response.data);
        } catch (err) {
            console.error("Error al cargar activos:", err);
            setError("No se pudieron cargar las fotos.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', type);

        try {
            const response = await fetchData('/technician/assets', {
                method: 'POST',
                body: formData,
            });
            setAssets((prev) => [...prev, response.data]);
        } catch (err) {
            console.error("Error al subir activo:", err);
            setError("Error al subir la imagen. Inténtalo de nuevo.");
        } finally {
            setUploading(false);
            // Reset input
            event.target.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta foto?")) return;

        try {
            await fetchData(`/technician/assets/${id}`, {
                method: 'DELETE',
            });
            setAssets((prev) => prev.filter(asset => asset.id !== id));
        } catch (err) {
            console.error("Error al eliminar activo:", err);
            setError("Error al eliminar la imagen.");
        }
    };

    if (loading) return <div className="text-center py-4 text-white/60">Cargando galería...</div>;

    return (
        <div className="flex flex-col gap-8 mt-6">
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}

            {assetTypes.map((type) => (
                <div key={type.id} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#c8d2d4]">
                            {type.icon} {type.label}
                        </h3>
                        <label className={`cursor-pointer flex items-center gap-2 bg-[#8c7e97] hover:bg-[#a493bd] text-white px-4 py-2 rounded-full text-sm font-medium transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Plus size={16} /> Añadir
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploading}
                                onChange={(e) => handleFileUpload(e, type.id)}
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {assets.filter(a => a.type === type.id).map((asset) => (
                            <div key={asset.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-[#3f4b4d] bg-[#1f2a2b]">
                                <img
                                    src={getStorageUrl(asset.image_path)}
                                    alt={type.label}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => handleDelete(asset.id)}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                                    title="Eliminar"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {assets.filter(a => a.type === type.id).length === 0 && (
                            <div className="col-span-full py-8 border-2 border-dashed border-[#3f4b4d] rounded-2xl flex flex-col items-center justify-center text-white/30 text-sm italic">
                                No hay fotos de {type.label.toLowerCase()}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AssetManager;
