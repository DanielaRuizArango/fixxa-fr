import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Usamos el proxy configurado o la URL base del .env
      // La ruta completa que el usuario especificó es http://localhost:8000/api/client/login
      // Como el proxy en vite.config.js redirige /api -> http://127.0.0.1:8000/
      // y la utilidad api.js usa el proxy, llamamos a /client/login
      const data = await fetchData('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log('Login exitoso:', data);

      // Guardar token si es necesario
      const token = data.data?.access_token || data.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      const role = data.data?.role;
      if (role) {
        localStorage.setItem('role', role);
      }

      // Redirigir al usuario según su rol
      if (role === 'client') {
        navigate("/indexCustomer");
      } else if (role === 'technician') {
        navigate("/indexTechnician");
      } else {
        alert("¡Bienvenido!");
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError("Error al iniciar sesión. Verifique sus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2526] font-['Kadwa']">
      <div className="w-[350px] flex flex-col gap-4 text-white">
        {/* Logo */}
        <div className="w-[350px] h-[252px] rounded-full flex items-center justify-center mx-auto mb-6 bg-[url('/images/fixxa-logo.svg')] bg-no-repeat bg-center bg-contain">
        </div>

        {/* Correo */}
        <label className="text-sm">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Contraseña */}
        <label className="text-sm">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <p className="text-xs text-right cursor-pointer hover:text-[#8C7E97]">
          ¿Olvidó su contraseña?
        </p>

        {/* Botón */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-2 transition duration-300 ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
            }`}
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>

        <p className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-[#8C7E97] hover:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;