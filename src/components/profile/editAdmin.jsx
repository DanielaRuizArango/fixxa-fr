import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ArrowLeft,
  Camera,
  Save,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { fetchData } from "../../api";

const EditAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    type_id: '',
    id_number: '',
    status: 'active',
    image: null
  });

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        setLoading(true);
        const response = await fetchData(`/admin/admins/${id}`);
        const admin = response.data;
        
        setFormData({
          name: admin.name || '',
          email: admin.email || '',
          phone: admin.phone || '',
          city: admin.city || '',
          address: admin.address || '',
          type_id: admin.type_id || '',
          id_number: admin.id_number || '',
          status: admin.status || 'active',
          image: null
        });

        if (admin.image) {
          setPreview(admin.image.startsWith('http') ? admin.image : `${import.meta.env.VITE_API_STORAGE_URL || ''}/${admin.image}`);
        }
      } catch (err) {
        setError("Error al cargar los datos del administrador.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadAdmin();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    const data = new FormData();
    // Laravel require POST with _method=PUT to handle multipart/form-data with PUT/PATCH
    data.append('_method', 'PUT');
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });

    try {
      await fetchData(`/admin/admins/${id}`, {
        method: 'POST', // Usamos POST con _method=PUT por limitaciones de PHP con FormData en PUT
        body: data,
      });
      navigate('/indexAdmin');
    } catch (err) {
      setError(err.data?.message || err.message || "Error al actualizar el administrador.");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2B2F36] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2B2F36] text-white font-['Kadwa'] p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/indexAdmin')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver a la lista</span>
        </button>

        <div className="bg-[#262f31] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
          <div className="bg-[#8C7E97] p-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Editar Administrador</h1>
                <p className="text-white/70 text-sm">Actualiza la información de la cuenta administrativa</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm mb-6 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Imagen de Perfil */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-3xl bg-[#1C2526] border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#8C7E97]">
                    {preview ? (
                      <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Camera size={32} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Foto</span>
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-[#8C7E97] p-3 rounded-2xl shadow-lg cursor-pointer hover:bg-[#77678a] transition-all transform hover:scale-110">
                    <Camera size={20} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">Estado actual: {formData.status}</p>
              </div>

              {/* Campos del Formulario */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} className="text-[#8C7E97]" /> Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#1C2526] border border-white/5 rounded-xl px-4 py-3 focus:border-[#8C7E97] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={14} className="text-[#8C7E97]" /> Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#1C2526] border border-white/5 rounded-xl px-4 py-3 focus:border-[#8C7E97] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone size={14} className="text-[#8C7E97]" /> Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#1C2526] border border-white/5 rounded-xl px-4 py-3 focus:border-[#8C7E97] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Ciudad */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} className="text-[#8C7E97]" /> Ciudad
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-[#1C2526] border border-white/5 rounded-xl px-4 py-3 focus:border-[#8C7E97] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Tipo de ID */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <CreditCard size={14} className="text-[#8C7E97]" /> Tipo de ID
                    </label>
                    <select
                      name="type_id"
                      value={formData.type_id}
                      onChange={handleChange}
                      className="w-full bg-[#1C2526] border border-white/5 rounded-xl px-4 py-3 focus:border-[#8C7E97] focus:outline-none transition-all appearance-none"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="NIT">NIT</option>
                      <option value="PP">Pasaporte</option>
                    </select>
                  </div>

                  {/* Número de ID */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <CreditCard size={14} className="text-[#8C7E97]" /> Número de ID
                    </label>
                    <input
                      type="text"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleChange}
                      className="w-full bg-[#1C2526] border border-white/5 rounded-xl px-4 py-3 focus:border-[#8C7E97] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} className="text-[#8C7E97]" /> Estado
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-[#1C2526] border border-white/5 rounded-xl px-4 py-3 focus:border-[#8C7E97] focus:outline-none transition-all appearance-none"
                    >
                      <option value="active">Activo</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-[#8C7E97]" /> Dirección Completa
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-[#1C2526] border border-white/5 rounded-xl px-4 py-3 focus:border-[#8C7E97] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/indexAdmin')}
                className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updating}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#8C7E97] hover:bg-[#77678a] transition-all text-sm font-bold uppercase tracking-widest shadow-xl disabled:opacity-50"
              >
                {updating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAdmin;
