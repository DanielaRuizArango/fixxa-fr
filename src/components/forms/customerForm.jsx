import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api";

const CustomerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    phone: "",
    city: "",
    address: "",
    type_id: "",
    id_number: "",
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
      if (formData.image) {
        data.append("image", formData.image);
      }

      await fetchData("/client/register", {
        method: "POST",
        headers: {},
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

  const inputClass = (field) =>
    `bg-[#4C5462] rounded-xl p-3 text-white outline-none focus:ring-2 placeholder:text-white/40 transition ${
      errors[field] ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2526] font-['Kadwa'] px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-4 text-white">

        {/* Logo */}
        <div className="w-full h-[150px] flex items-center justify-center mx-auto mb-2 bg-[url('/images/fixxa-logo.svg')] bg-no-repeat bg-center bg-contain" />

        {/* Nombre completo */}
        <label className="text-sm">Nombre completo</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Tu nombre completo"
          className={inputClass("name")}
        />
        {errors.name && <p className="text-red-500 text-xs -mt-2">{errors.name[0]}</p>}

        {/* Correo */}
        <label className="text-sm">Correo</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="correo@ejemplo.com"
          className={inputClass("email")}
        />
        {errors.email && <p className="text-red-500 text-xs -mt-2">{errors.email[0]}</p>}

        {/* Contraseña */}
        <label className="text-sm">Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Tu contraseña"
          className={inputClass("password")}
        />
        {errors.password && <p className="text-red-500 text-xs -mt-2">{errors.password[0]}</p>}

        {/* Celular */}
        <label className="text-sm">Celular</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+123 456 7890"
          className={inputClass("phone")}
        />
        {errors.phone && <p className="text-red-500 text-xs -mt-2">{errors.phone[0]}</p>}

        {/* Ciudad */}
        <label className="text-sm">Ciudad</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="Ciudad donde resides"
          className={inputClass("city")}
        />
        {errors.city && <p className="text-red-500 text-xs -mt-2">{errors.city[0]}</p>}

        {/* Dirección */}
        <label className="text-sm">Dirección</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Tu dirección"
          className={inputClass("address")}
        />
        {errors.address && <p className="text-red-500 text-xs -mt-2">{errors.address[0]}</p>}

        {/* Tipo de documento */}
        <label className="text-sm">Tipo de documento</label>
        <select
          name="type_id"
          value={formData.type_id}
          onChange={handleInputChange}
          className={inputClass("type_id")}
        >
          <option value="" disabled>Selecciona un tipo</option>
          <option value="cedula">Cédula</option>
          <option value="pasaporte">Pasaporte</option>
          <option value="otro">Otro</option>
        </select>
        {errors.type_id && <p className="text-red-500 text-xs -mt-2">{errors.type_id[0]}</p>}

        {/* Número de documento */}
        <label className="text-sm">Número de documento</label>
        <input
          type="text"
          name="id_number"
          value={formData.id_number}
          onChange={handleInputChange}
          placeholder="Número de documento"
          className={inputClass("id_number")}
        />
        {errors.id_number && <p className="text-red-500 text-xs -mt-2">{errors.id_number[0]}</p>}

        {/* Foto de perfil */}
        <label className="text-sm">Foto de perfil</label>
        <label
          className={`flex flex-col items-center justify-center gap-2 bg-[#4C5462] rounded-xl p-4 cursor-pointer border-2 border-dashed transition-colors ${
            errors.image ? "border-red-500" : "border-[#8C7E97] hover:border-white"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-[#8C7E97]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-sm text-[#8C7E97]">
            {formData.image ? formData.image.name : "Sube tu foto de perfil"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {formData.image && (
          <img
            src={URL.createObjectURL(formData.image)}
            alt="Vista previa"
            className="rounded-xl object-cover w-full h-40 border border-[#8C7E97]/30"
          />
        )}
        {errors.image && <p className="text-red-500 text-xs -mt-2">{errors.image[0]}</p>}

        {generalError && (
          <p className="text-red-500 text-sm text-center font-bold mt-2">{generalError}</p>
        )}

        {/* Botón enviar */}
        <button
          onClick={handleSubmit}
          className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-4 hover:opacity-80 transition duration-300 shadow-lg shadow-[#8C7E97]/20"
        >
          Registrarse
        </button>

        {/* Atrás */}
        <p className="text-center text-sm mt-2 mb-6">
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

export default CustomerForm;
