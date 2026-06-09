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
    id_photo: null,
    certificates: [],
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

  const handleIdPhotoChange = (e) => {
    setFormData({ ...formData, id_photo: e.target.files[0] });
  };

  const handleCertificatesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, certificates: files });
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
      if (formData.id_photo) {
        data.append("id_photo", formData.id_photo);
      }
      formData.certificates.forEach((file, index) => {
        data.append(`certificates[${index}]`, file);
      });

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

  const inputClass = (field) =>
    `bg-[#4C5462] rounded-xl p-3 text-white outline-none focus:ring-2 ${
      errors[field] ? "ring-2 ring-red-500" : "focus:ring-[#8C7E97]"
    }`;

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
          className={inputClass("name")}
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
          className={inputClass("email")}
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
          className={inputClass("password")}
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
          className={inputClass("phone")}
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
          className={inputClass("city")}
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
          className={inputClass("address")}
        />
        {errors.address && <p className="text-red-500 text-xs">{errors.address[0]}</p>}

        {/* Tipo de documento */}
        <label className="text-sm">Tipo de documento</label>
        <select
          name="type_id"
          value={formData.type_id}
          onChange={handleInputChange}
          className={inputClass("type_id")}
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
          className={inputClass("id_number")}
        />
        {errors.id_number && <p className="text-red-500 text-xs">{errors.id_number[0]}</p>}

        {/* Foto de cédula */}
        <label className="text-sm">Foto de cédula</label>
        <label
          className={`flex flex-col items-center justify-center gap-2 bg-[#4C5462] rounded-xl p-4 cursor-pointer border-2 border-dashed transition-colors ${
            errors.id_photo ? "border-red-500" : "border-[#8C7E97] hover:border-white"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#8C7E97]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10a4 4 0 014-4h1.5l1-2h5l1 2H17a4 4 0 014 4v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z" />
            <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          </svg>
          <span className="text-sm text-[#8C7E97]">
            {formData.id_photo ? formData.id_photo.name : "Sube una foto de tu cédula"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleIdPhotoChange}
            className="hidden"
          />
        </label>
        {formData.id_photo && (
          <img
            src={URL.createObjectURL(formData.id_photo)}
            alt="Vista previa cédula"
            className="rounded-xl object-cover w-full h-40 mt-1"
          />
        )}
        {errors.id_photo && <p className="text-red-500 text-xs">{errors.id_photo[0]}</p>}

        {/* Certificados */}
        <label className="text-sm">Certificados</label>
        <label
          className={`flex flex-col items-center justify-center gap-2 bg-[#4C5462] rounded-xl p-4 cursor-pointer border-2 border-dashed transition-colors ${
            errors.certificates ? "border-red-500" : "border-[#8C7E97] hover:border-white"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#8C7E97]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm text-[#8C7E97] text-center">
            {formData.certificates.length > 0
              ? `${formData.certificates.length} archivo(s) seleccionado(s)`
              : "Sube fotos de tus certificados (puedes elegir varios)"}
          </span>
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={handleCertificatesChange}
            className="hidden"
          />
        </label>
        {formData.certificates.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {formData.certificates.map((file, i) => (
              file.type.startsWith("image/") ? (
                <img
                  key={i}
                  src={URL.createObjectURL(file)}
                  alt={`Certificado ${i + 1}`}
                  className="rounded-lg object-cover w-20 h-20"
                />
              ) : (
                <div key={i} className="flex items-center gap-1 bg-[#3a404d] rounded-lg px-3 py-2 text-xs text-[#8C7E97]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {file.name}
                </div>
              )
            ))}
          </div>
        )}
        {errors.certificates && <p className="text-red-500 text-xs">{errors.certificates[0]}</p>}

        {/* Experiencia */}
        <label className="text-sm">Experiencia</label>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleInputChange}
          placeholder="Describe tu experiencia laboral"
          rows="3"
          className={`${inputClass("experience")} resize-none`}
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
          className={inputClass("title")}
        />
        {errors.title && <p className="text-red-500 text-xs">{errors.title[0]}</p>}

        {/* Foto de perfil */}
        <label className="text-sm">Foto de perfil</label>
        <label
          className={`flex flex-col items-center justify-center gap-2 bg-[#4C5462] rounded-xl p-4 cursor-pointer border-2 border-dashed transition-colors ${
            errors.image ? "border-red-500" : "border-[#8C7E97] hover:border-white"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#8C7E97]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
            alt="Vista previa perfil"
            className="rounded-xl object-cover w-full h-40 mt-1"
          />
        )}
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
