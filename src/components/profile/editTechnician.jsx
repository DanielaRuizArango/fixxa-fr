import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api";
import AssetManager from "./AssetManager";

const EditTechnician = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const [user, setUser] = useState({
    image: null,
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    password: '',
    id_number: '',
    title: '',
    experience: '',
    working_hours: '',
    is_available: true,
  });

  const [preview, setPreview] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchData('/technician/me');
        const data = response.data;
        setUser({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          address: data.address || '',
          password: '', // Password stays empty unless user wants to change it
          id_number: data.id_number || '', 
          title: data.technician?.title || '',
          experience: data.technician?.experience || '',
          working_hours: data.technician?.working_hours || '',
          is_available: data.technician?.is_available ?? true,
          image: null, // Don't track image content in state, just the file
        });
        
        if (data.image) {
          setPreview(data.image.startsWith('http') ? data.image : `${import.meta.env.VITE_API_STORAGE_URL || ''}/${data.image}`);
        }
      } catch (err) {
        setError("Error al cargar el perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUser((prev) => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setUser((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUpdating(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('phone', user.phone);
    formData.append('city', user.city);
    formData.append('address', user.address);
    formData.append('title', user.title);
    formData.append('experience', user.experience);
    formData.append('working_hours', user.working_hours);
    formData.append('is_available', user.is_available ? '1' : '0');
    
    if (user.image) {
      formData.append('image', user.image);
    }
    
    if (user.password) {
      formData.append('password', user.password);
    }

    try {
      await fetchData('/technician/profile', {
        method: 'POST',
        body: formData,
      });
      navigate('/technicianProfile');
    } catch (err) {
      setError(err.message || "Error al actualizar el perfil.");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C2526] flex items-center justify-center text-white">
        <p className="animate-pulse">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C2526] via-[#263032] to-[#1C2526] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg bg-[#262f31] rounded-3xl p-7 text-white shadow-2xl border border-[#3f4b4d]">
        <h1 className="text-3xl font-bold text-center mb-5">Editar Perfil Técnico</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#8c7e97] bg-[#ffffff18]">
                <img
                src={preview || '/images/fixxa-logo.svg'}
                alt="Perfil"
                className="w-full h-full object-cover"
                />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-white/80 file:bg-[#8c7e97] file:text-white file:px-3 file:py-1 file:rounded-full"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Título / Especialidad</label>
              <input
                type="text"
                name="title"
                value={user.title}
                onChange={handleChange}
                required
                placeholder="Ej: Técnico en refrigeración"
                className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1f2a2b] rounded-xl border border-[#3f4b4d]">
              <div>
                <p className="text-sm font-medium text-white">Estado de Disponibilidad</p>
                <p className="text-[10px] text-gray-400">Activa para recibir notificaciones de nuevos casos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_available"
                  checked={user.is_available} 
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8c7e97]"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#c8d2d4]">Teléfono</label>
                <input
                    type="tel"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
                />
                </div>
                <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#c8d2d4]">Documento ID</label>
                <input
                    type="text"
                    name="id_number"
                    value={user.id_number}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
                />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#c8d2d4]">Ciudad</label>
                <input
                    type="text"
                    name="city"
                    value={user.city}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
                />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Dirección</label>
              <input
                type="text"
                name="address"
                value={user.address}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Nueva Contraseña (opcional)</label>
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                placeholder="Dejar en blanco para mantener actual"
                className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Horario de Atención</label>
              <input
                type="text"
                name="working_hours"
                value={user.working_hours}
                onChange={handleChange}
                placeholder="Ej: Lunes a Viernes 8am - 6pm"
                className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#c8d2d4]">Experiencia</label>
              <textarea
                name="experience"
                value={user.experience}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              disabled={updating}
              className={`w-full py-3 rounded-xl bg-[#8c7e97] text-white text-base font-semibold transition ${updating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#a493bd]'}`}
            >
              {updating ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/technicianProfile')}
              className="w-full py-3 rounded-xl border border-[#8c7e97] text-[#8c7e97] hover:bg-white/10 transition"
            >
              Cancelar
            </button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-[#3f4b4d]">
          <h2 className="text-2xl font-bold text-center mb-2">Galería de Profesional</h2>
          <p className="text-center text-white/50 text-sm mb-6">Sube fotos de tus herramientas, certificaciones y trabajos previos para generar más confianza en tus clientes.</p>
          <AssetManager />
        </div>
      </div>
    </div>
  );
};

export default EditTechnician;
