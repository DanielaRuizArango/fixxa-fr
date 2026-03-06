import { useNavigate } from "react-router-dom";
const CustomerForm = () => {
  const navigate = useNavigate();
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
          placeholder="Tu nombre completo"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Correo */}
        <label className="text-sm">Correo</label>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Celular */}
        <label className="text-sm">Celular</label>
        <input
          type="tel"
          placeholder="+123 456 7890"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Ciudad */}
        <label className="text-sm">Ciudad</label>
        <input
          type="text"
          placeholder="Ciudad donde resides"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Dirección */}
        <label className="text-sm">Dirección</label>
        <input
          type="text"
          placeholder="Tu dirección"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Tipo de documento */}
        <label className="text-sm">Tipo de documento</label>
        <select
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
          defaultValue=""
        >
          <option value="" disabled>Selecciona un tipo</option>
          <option value="Cédula">Cédula</option>
          <option value="Pasaporte">Pasaporte</option>
          <option value="otro">Otro</option>
        </select>

        {/* Número de documento */}
        <label className="text-sm">Número de documento</label>
        <input
          type="text"
          placeholder="Número de documento"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Imagen */}
        <label className="text-sm">Imagen</label>
        <input
          type="file"
          accept="image/*"
          className="bg-[#4C5462] rounded-lg p-1 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Botón de enviar */}
        <button className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-4 hover:opacity-80 transition duration-300">
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