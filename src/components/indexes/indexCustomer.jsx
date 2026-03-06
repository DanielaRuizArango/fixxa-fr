import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, User, Plus } from "lucide-react";

const IndexCustomer = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#2B2F36] font-['Kadwa'] text-white">

      {/* Header */}
      <header className="bg-[#8C7E97] flex justify-end items-center px-8 py-4 gap-2">
        <span className="text-xl font-semibold">Customer</span>
        <a onClick={() => navigate("/customerProfile")}><User size={28} /></a>
      </header>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-[#0F2027] to-[#203A43] min-h-[calc(100vh-72px)] p-6 space-y-4">
          <button
            onClick={handleLogout}
            className="block w-full text-left text-lg py-2 px-4 rounded hover:bg-[#8C7E97] transition box-border"
          >
            log out
          </button>
          <button className="block w-full text-left text-lg py-2 px-4 rounded hover:bg-[#8C7E97] transition box-border">
            Botón
          </button>
          <button className="block w-full text-left text-lg py-2 px-4 rounded hover:bg-[#8C7E97] transition box-border">
            Botón
          </button>
          <button className="block w-full text-left text-lg py-2 px-4 rounded hover:bg-[#8C7E97] transition box-border">
            Botón
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 relative">

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

        </main>
      </div>
    </div>
  );
};

export default IndexCustomer;