import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2526] font-['Kadwa']">
      
      <div className="w-[350px] flex flex-col gap-4 text-white">
        
        {/* Logo */}
        <div className="w-[350px] h-[252px] rounded-full flex items-center justify-center mx-auto mb-6 bg-[url('/images/fixxa-logo.svg')] bg-no-repeat bg-center bg-contain">
        </div>

        <label className="text-xl text-center ">Se desea registrar como:</label>

        {/* Usuario */}
        <button
          onClick={() => navigate("/customerForm")}
          className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-2 hover:opacity-80 transition duration-300"
        >
          Usuario
        </button>

        <label className="text-xl text-center">O</label>

        {/* Técnico */}
        <button
          onClick={() => navigate("/technicianForm")}
          className="bg-[#8C7E97] py-3 rounded-full text-white text-lg mt-2 hover:opacity-80 transition duration-300"
        >
          Técnico
        </button>
        
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

export default Register;