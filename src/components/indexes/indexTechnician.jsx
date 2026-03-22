import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import MainLayout from "../templates/MainLayout";

const IndexTechnical = () => {
  const navigate = useNavigate();

  return (
    <MainLayout roleName="Technical" profileRoute="/technicianProfile">

      {/* Card de caso */}
      <div className="bg-[#8C7E97] rounded-xl px-8 py-6 flex justify-between items-center">

        {/* Lado izquierdo */}
        <div>
          <p className="text-lg font-medium">Nombre de caso</p>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-16">

          <div className="text-sm text-right">
            <p>Estado</p>
            <p className="mt-2">Localización</p>
          </div>

          <div className="text-sm text-right">
            <p>FTS-000000</p>
          </div>

          {/* Flecha */}
          <button
            onClick={() => navigate("/case-detail")}
            className="text-black text-xl font-bold hover:scale-125 transition"
          >
            &gt;
          </button>

        </div>
      </div>

      {/* Botón flotante */}
      <button
        onClick={() => navigate("/create-case")}
        className="absolute bottom-10 right-10 bg-black p-4 rounded-xl shadow-lg hover:scale-110 transition"
      >
        <Plus size={24} />
      </button>

    </MainLayout>
  );
};

export default IndexTechnical;