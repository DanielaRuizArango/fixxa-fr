import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api";

const CustomerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "technician",
    phone: "",
    city: "",
    address: "",
    type_id: "",
    id_number: "",
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("phone", formData.phone);
      data.append("city", formData.city);
      data.append("address", formData.address);
      data.append("type_id", formData.type_id);
      data.append("id_number", formData.id_number);
      if (formData.image) {
        data.append("image", formData.image);
      }

      await fetchData("/customer/register", {
        method: "POST",
        headers: {},
        body: data,
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2526] font-['Kadwa'] px-4">
      <div className="w-full max-w-md flex flex-col gap-4 text-white">

        {/* Logo */}
        <div className="w-full h-[150px] rounded-full flex items-center justify-center mx-auto mb-6 bg-[url('/images/fixxa-logo.svg')] bg-no-repeat bg-center bg-contain">
        </div>

        {/* Nombre completo */}
        <label className="text-sm">Nombre completo</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Tu nombre completo"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Correo */}
        <label className="text-sm">Correo</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="correo@ejemplo.com"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Contraseña */}
        <label className="text-sm">Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Tu contraseña"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Celular */}
        <label className="text-sm">Celular</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+123 456 7890"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Ciudad */}
        <label className="text-sm">Ciudad</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="Ciudad donde resides"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Dirección */}
        <label className="text-sm">Dirección</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Tu dirección"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Tipo de documento */}
        <label className="text-sm">Tipo de documento</label>
        <select
          name="type_id"
          value={formData.type_id}
          onChange={handleInputChange}
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        >
          <option value="" disabled>Selecciona un tipo</option>
          <option value="cedula">Cédula</option>
          <option value="pasaporte">Pasaporte</option>
          <option value="otro">Otro</option>
        </select>

        {/* Número de documento */}
        <label className="text-sm">Número de documento</label>
        <input
          type="text"
          name="id_number"
          value={formData.id_number}
          onChange={handleInputChange}
          placeholder="Número de documento"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Imagen */}
        <label className="text-sm">Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="bg-[#4C5462] rounded-lg p-1 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Botón de enviar */}
        <button
          onClick={handleSubmit}
          className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-4 hover:opacity-80 transition duration-300"
        >
          Enviar
        </button>

        {/* Atras */}
        <p className="text-center text-sm mt-4">
          <button
            onClick={() => navigate("/register")}
            className="text-[#8C7E97] hover:underline cursor-pointer"
          >
            Atras
          </button>
        </p>

      </div>
    </div>
  )
}

export default CustomerForm