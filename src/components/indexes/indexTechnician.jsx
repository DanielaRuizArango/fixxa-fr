import { useNavigate } from "react-router-dom";
import { User, Plus } from "lucide-react";

const IndexTechnical = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2B2F36] font-['Kadwa'] text-white">

      {/* Header */}
      <header className="bg-[#8C7E97] flex justify-end items-center px-8 py-4 gap-2">
        <span className="text-xl font-semibold">Technical</span>
        <User size={28} />
      </header>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-[#0F2027] to-[#203A43] min-h-[calc(100vh-72px)] p-6 space-y-4">

          <button className="block w-full text-left text-lg py-2 px-4 rounded hover:bg-[#8C7E97] box-border">
            Botón
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

        </main>
      </div>
    </div>
  );
};

export default IndexTechnical;