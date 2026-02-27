import { Link } from "react-router-dom"
const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2526] font-['Kadwa']">
      
      <div className="w-[350px] flex flex-col gap-4 text-white">
        
        {/* Logo */}
        <div className="w-[350px] h-[252px] rounded-full flex items-center justify-center mx-auto mb-6 bg-[url('/images/fixxa-logo.svg')] bg-no-repeat bg-center bg-contain">
        </div>

        {/* Correo */}
        <label className="text-xl text-center ">Se desea registrar como:</label>

        {/* Botón */}
        <Link
        to="/customerForm"
        className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-2 hover:opacity-80 transition duration-300 inline-block text-center"
        >
        Usuario
        </Link>

        {/* Contraseña */}
        <label className="text-xl text-center">O</label>

        {/* Botón */}
        <button className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-2 hover:opacity-80 transition duration-300">
          Técnico
        </button>
        
        {/* Cancelar */}
        <Link
          to="/login"
          className="text-center text-[#8C7E97] mt-6 cursor-pointer hover:underline"
        >
          Cancelar
        </Link>
      </div>
    </div>
  );
};

export default Register;