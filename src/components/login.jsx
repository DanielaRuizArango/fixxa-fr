import { Link } from "react-router-dom"
const Login = () => {
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
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        {/* Contraseña */}
        <label className="text-sm">Contraseña</label>
        <input
          type="password"
          className="bg-[#4C5462] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-[#8C7E97]"
        />

        <p className="text-xs text-right cursor-pointer hover:text-[#8C7E97]">
          ¿Olvidó su contraseña?
        </p>

        {/* Botón */}
        <button className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-2 hover:opacity-80 transition duration-300">
          Ingresar
        </button>

        <p className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/register"
            className="text-[#8C7E97] hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;