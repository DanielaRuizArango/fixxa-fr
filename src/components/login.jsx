import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../api";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, complete todos los campos.",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
      });
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

      // Intentar obtener el objeto de usuario en diferentes niveles
      const user = data.data?.user || data.user;
      
      // Obtener el rol directamente de la respuesta del backend
      const role = data.data?.role || data.role;
      
      if (role) {
        localStorage.setItem('role', role);
      }

      const userId = data.data?.user?.id;
      if (userId) {
        localStorage.setItem('userId', userId);
      }

      const name = data.data?.user?.name || data.data?.name;
      if (name) {
        localStorage.setItem('userName', name);
      }

      if (data.data?.user?.technician?.id) {
        localStorage.setItem('technicianId', data.data.user.technician.id);
      }

      if (data.data?.user?.client?.id) {
        localStorage.setItem('clientId', data.data.user.client.id);
      }

      // Alerta de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Hola de nuevo, ${name || 'Usuario'}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1C2526',
        color: '#ffffff',
      });

      // Redirigir al usuario según su rol
      if (role === 'client') {
        navigate("/indexCustomer");
      } else if (role === 'technician') {
        navigate("/indexTechnician");
      } else if (role === 'super_admin') {
        navigate("/indexAdmin");
      } else if (role === 'admin' || role === 'moderator') {
        navigate("/indexClientAdmin");
      }
    } catch (err) {
      console.error('Error en login:', err);
      const msg = err.message || "Error al iniciar sesión. Verifique sus credenciales.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error al ingresar",
        text: msg,
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
      });
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
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="ejemplo@correo.com"
          className="bg-[#4C5462] rounded-lg p-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Contraseña */}
        <label className="text-sm">Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="********"
            className="w-full bg-[#4C5462] rounded-lg p-3 pr-10 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <p className="text-xs text-right cursor-pointer hover:text-[#8C7E97]" onClick={() => navigate("/forgotpassword")}>
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