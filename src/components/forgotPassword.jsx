import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchData } from "../api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [token, setToken] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");
    
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      setIsResetMode(true);
    }
  }, [searchParams]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetchData("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage({
        type: "success",
        text: response.message || "Se ha enviado un correo de recuperación.",
      });
      
      // Clear email after success
      setEmail("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Error al enviar el correo de recuperación.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetchData("/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: passwordConfirmation, // Rails/Laravel convention
        }),
      });

      setMessage({
        type: "success",
        text: response.message || "Contraseña restablecida con éxito.",
      });

      // Redirect to login after a short delay
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Error al restablecer la contraseña.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2526] font-['Kadwa']">
      <div className="w-[350px] flex flex-col gap-4 text-white">
        {/* Logo */}
        <div className="w-[350px] h-[252px] rounded-full flex items-center justify-center mx-auto mb-6 bg-[url('/images/fixxa-logo.svg')] bg-no-repeat bg-center bg-contain">
        </div>

        <h2 className="text-xl text-center mb-4">
          {isResetMode ? "Restablecer Contraseña" : "Recuperar Contraseña"}
        </h2>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm mb-4 ${
            message.type === "success" ? "bg-green-500/20 text-green-300 border border-green-500/50" : "bg-red-500/20 text-red-300 border border-red-500/50"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={isResetMode ? handleResetPassword : handleForgotPassword} className="flex flex-col gap-4">
          {!isResetMode ? (
            /* Forgot Password Form */
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
                disabled={isLoading}
              />
            </div>
          ) : (
            /* Reset Password Form */
            <>
              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 rounded-full bg-[#353c48] text-gray-300 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-[#4C5462] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8C7E97]"
                  placeholder="********"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </div>
              <div>
                <label htmlFor="passwordConfirmation" className="block text-sm mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="passwordConfirmation"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-[#4C5462] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8C7E97]"
                  placeholder="********"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </div>
            </>
          )}

          {/* Botón de enviar */}
          <button
            type="submit"
            className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-2 hover:opacity-80 transition duration-300 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              isResetMode ? "Restablecer Contraseña" : "Enviar Solicitud"
            )}
          </button>
        </form>

        {/* Cancelar */}
        <button
          onClick={() => navigate("/login")}
          className="text-center text-[#8C7E97] mt-6 cursor-pointer hover:underline"
        >
          {isResetMode ? "Ir al Login" : "Cancelar"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;