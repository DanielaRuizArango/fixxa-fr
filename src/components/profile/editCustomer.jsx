import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api";

const EditCustomer = () => {
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
  });

  const [preview, setPreview] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchData('/client/me');
        const data = response.data;
        setUser({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          address: data.address || '',
          password: '',
          image: null,
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
    const { name, value } = event.target;
    setUser((prev) => ({ ...prev, [name]: value }));
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
    
    if (user.image) {
      formData.append('image', user.image);
    }
    
    if (user.password) {
      formData.append('password', user.password);
    }

    try {
      await fetchData('/client/profile', {
        method: 'POST',
        body: formData,
      });
      navigate('/customerProfile');
    } catch (err) {
      setError(err.message || "Error al actualizar el perfil.");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C2526] flex items-center justify-center text-white font-['Kadwa']">
        <p className="animate-pulse">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C2526] via-[#263032] to-[#1C2526] flex items-center justify-center p-4 py-8 font-['Kadwa']">
      <div className="w-full max-w-lg bg-[#262f31] rounded-3xl p-7 text-white shadow-2xl border border-[#3f4b4d]">
        <h1 className="text-3xl font-bold text-center mb-5">Editar Usuario</h1>

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
              <label className="text-sm font-medium text-[#c8d2d4]">Nombre</label>
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
                <label className="text-sm font-medium text-[#c8d2d4]">Ciudad</label>
                <input
                    type="text"
                    name="city"
                    value={user.city}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
                />
                </div>
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
              onClick={() => navigate('/customerProfile')}
              className="w-full py-3 rounded-xl border border-[#8c7e97] text-[#8c7e97] hover:bg-white/10 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;