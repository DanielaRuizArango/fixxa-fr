import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api";

const TechnicianForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    address: "",
    type_id: "",
    id_number: "",
    experience: "",
    title: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

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
      data.append("experience", formData.experience);
      data.append("title", formData.title);
      if (formData.image) {
        data.append("image", formData.image);
      }

      await fetchData("/technician/register", {
        method: "POST",
        headers: {}, // Remove Content-Type for FormData
        body: data,
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.data && error.data.errors) {
        setErrors(error.data.errors);
        setGeneralError("Por favor, corrige los errores en el formulario.");
      } else {
        setGeneralError(error.message || "Ocurrió un error inesperado.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2526] font-['Kadwa'] px-4">
      <div className="w-full max-w-md flex flex-col gap-4 text-white">

        {/* Logo */}
        <div className="w-full h-[150px] rounded-full flex items-center justify-center mx-auto mb-6 bg-[url('/images/fixxa-logo.svg')] bg-no-repeat bg-center bg-contain">
        </div>

        {/* Nombre */}
        <label className="text-sm">Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Tu nombre completo"
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.name ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name[0]}</p>}

        {/* Correo */}
        <label className="text-sm">Correo</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="correo@ejemplo.com"
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.email ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email[0]}</p>}

        {/* Contraseña */}
        <label className="text-sm">Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Tu contraseña"
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.password ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password[0]}</p>}

        {/* Celular */}
        <label className="text-sm">Celular</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+123 456 7890"
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.phone ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        />
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone[0]}</p>}

        {/* Ciudad */}
        <label className="text-sm">Ciudad</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="Ciudad donde resides"
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.city ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        />
        {errors.city && <p className="text-red-500 text-xs">{errors.city[0]}</p>}

        {/* Dirección */}
        <label className="text-sm">Dirección</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Tu dirección"
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.address ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        />
        {errors.address && <p className="text-red-500 text-xs">{errors.address[0]}</p>}

        {/* Tipo de documento */}
        <label className="text-sm">Tipo de documento</label>
        <select
          name="type_id"
          value={formData.type_id}
          onChange={handleInputChange}
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.type_id ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        >
          <option value="" disabled>Selecciona un tipo</option>
          <option value="dni">DNI</option>
          <option value="pasaporte">Pasaporte</option>
          <option value="cedula">Cédula</option>
          <option value="otro">Otro</option>
        </select>
        {errors.type_id && <p className="text-red-500 text-xs">{errors.type_id[0]}</p>}

        {/* Número de documento */}
        <label className="text-sm">Número de documento</label>
        <input
          type="text"
          name="id_number"
          value={formData.id_number}
          onChange={handleInputChange}
          placeholder="Número de documento"
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.id_number ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        />
        {errors.id_number && <p className="text-red-500 text-xs">{errors.id_number[0]}</p>}

        {/* Experiencia */}
        <label className="text-sm">Experiencia</label>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleInputChange}
          placeholder="Describe tu experiencia laboral"
          rows="3"
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.experience ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"} resize-none`}
        />
        {errors.experience && <p className="text-red-500 text-xs">{errors.experience[0]}</p>}

        {/* Título */}
        <label className="text-sm">Título</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Ej: Técnico en refrigeración"
          className={`bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 ${errors.title ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        />
        {errors.title && <p className="text-red-500 text-xs">{errors.title[0]}</p>}

        {/* Imagen */}
        <label className="text-sm">Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={`bg-[#4C5462] rounded-lg p-1 text-white outline-none focus:ring-2 ${errors.image ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"}`}
        />
        {errors.image && <p className="text-red-500 text-xs">{errors.image[0]}</p>}

        {generalError && <p className="text-red-500 text-sm text-center font-bold mt-2">{generalError}</p>}

        {/* Botón de enviar */}
        <button
          onClick={handleSubmit}
          className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-4 hover:opacity-80 transition duration-300"
        >
          Registrar Técnico
        </button>

        {/* Atrás */}
        <p className="text-center text-sm mt-4">
          <button
            onClick={() => navigate("/register")}
            className="text-[#8C7E97] hover:underline cursor-pointer"
          >
            Atrás
          </button>
        </p>

      </div>
    </div>
  );
};

export default TechnicianForm;