import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, User, Mail, Phone, MapPin, ArrowLeft, Briefcase, Award } from "lucide-react";
import MainLayout from "../templates/MainLayout";

const TechnicianProfile = () => {
  const navigate = useNavigate();

  // Datos de ejemplo (luego puedes traerlos desde tu backend)
  const technician = {
    name: "Carlos Técnico",
    email: "carlos.tecnico@email.com",
    phone: "+57 310 987 6543",
    address: "Medellín, Colombia",
    title: "Técnico Especialista en Refrigeración",
    experience: "5 años trabajando con sistemas de climatización industrial y mantenimiento preventivo.",
  };

  return (
    <MainLayout roleName="Technical" profileRoute="/technicianProfile">

      {/* Botón de regreso */}
      <button
        onClick={() => navigate("/indexTechnician")}
        className="absolute left-10 top-6 flex items-center gap-2 bg-[#8C7E97] px-4 py-2 rounded-lg hover:bg-[#77678a]"
      >
        <ArrowLeft size={18} />
        Regresar
      </button>

      <div className="flex justify-center pt-10">
        <div className="bg-[#3A3F47] rounded-xl p-10 w-full max-w-2xl shadow-lg">

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#2B2F36] p-6 rounded-full mb-4">
              <User size={120} />
            </div>
            <h1 className="text-3xl font-bold">{technician.name}</h1>
            <p className="text-gray-300">Perfil de Técnico</p>
          </div>

          {/* Info */}
          <div className="space-y-4 text-lg">

            <div className="flex items-center gap-3">
              <Mail size={20} className="text-[#8C7E97]" />
              <span>{technician.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={20} className="text-[#8C7E97]" />
              <span>{technician.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <Award size={20} className="text-[#8C7E97]" />
              <span>{technician.title}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-[#8C7E97]" />
              <span>{technician.address}</span>
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Briefcase size={20} className="text-[#8C7E97]" />
                <span>Experiencia Laboral</span>
              </div>
              <p className="text-gray-300 text-base leading-relaxed">
                {technician.experience}
              </p>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8">

            <button
              onClick={() => navigate("/editTechnician")}
              className="flex items-center gap-2 bg-[#8C7E97] px-4 py-2 rounded-lg hover:bg-[#77678a]"
            >
              <Pencil size={18} />
              Editar
            </button>

            <button className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600">
              <Trash2 size={18} />
              Eliminar
            </button>

          </div>
        </div>
      </div>

    </MainLayout>
  );
};

export default TechnicianProfile;
