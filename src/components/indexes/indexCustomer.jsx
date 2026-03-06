import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import MainLayout from "../templates/MainLayout";

const IndexCustomer = () => {
  const navigate = useNavigate();

  return (
    <MainLayout roleName="Customer" profileRoute="/customerProfile">

      {/* Card de caso */}
      <div className="bg-[#8C7E97] rounded-xl p-6 flex justify-between items-start">

        <div>
          <p className="text-lg">Nombre de caso</p>
          <p className="text-sm mt-2">Técnicos interesados: #</p>
        </div>

        <div className="text-right space-y-3">
          <p className="text-sm">Estado</p>
          <p className="text-sm">FTS-000000</p>

          <div className="flex gap-3 justify-end mt-3">
            <button className="hover:text-black">
              <Pencil size={20} />
            </button>
            <button className="hover:text-black">
              <Trash2 size={20} />
            </button>
          </div>
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

export default IndexCustomer;