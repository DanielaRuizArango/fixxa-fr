import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar la solicitud de recuperación
    console.log("Enviando solicitud de recuperación para:", email);
    // Por ahora, solo navegamos de vuelta al login
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2526] font-['Kadwa']">

      <div className="w-[350px] flex flex-col gap-4 text-white">

        {/* Logo */}
        <div className="w-[350px] h-[252px] rounded-full flex items-center justify-center mx-auto mb-6 bg-[url('/images/fixxa-logo.svg')] bg-no-repeat bg-center bg-contain">
        </div>

        <h2 className="text-xl text-center mb-4">Recuperar Contraseña</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo de correo */}
          <div>
            <label htmlFor="email" className="block text-sm mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-[#4C5462] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8C7E97]"
              placeholder="Ingresa tu correo electrónico"
              required
            />
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-2 hover:opacity-80 transition duration-300"
          >
            Enviar Solicitud
          </button>
        </form>

        {/* Cancelar */}
        <button
          onClick={() => navigate("/login")}
          className="text-center text-[#8C7E97] mt-6 cursor-pointer hover:underline"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;