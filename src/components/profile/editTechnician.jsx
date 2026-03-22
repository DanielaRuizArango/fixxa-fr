import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EditTechnician = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    image: '',
    name: 'Carlos Técnico',
    role: 'technician',
    phone: '555-5678',
    city: 'Medellín',
    address: 'Calle Técnica 456',
    id_number: '123456789',
    title: 'Técnico Especialista',
    experience: '5 años de experiencia en refrigeración industrial.',
  });

  const [preview, setPreview] = useState('');

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setUser((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Guardando técnico:', user);
    // TODO: enviar datos a la API
    // navigate('/technicianProfile');
    navigate('/technicianProfile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C2526] via-[#263032] to-[#1C2526] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg bg-[#262f31] rounded-3xl p-7 text-white shadow-2xl border border-[#3f4b4d]">
        <h1 className="text-3xl font-bold text-center mb-5">Editar Perfil Técnico</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#8c7e97] bg-[#ffffff18]">
                <img
                src={preview || user.image || '/images/fixxa-logo.svg'}
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

            <div className="grid grid-cols-2 gap-4">
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
              className="w-full py-3 rounded-xl bg-[#8c7e97] text-white text-base font-semibold hover:bg-[#a493bd] transition"
            >
              Guardar Cambios
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
      </div>
    </div>
  );
};

export default EditTechnician;
