import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, User, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";

const CustomerProfile = () => {
  const navigate = useNavigate();

  // Datos de ejemplo (luego puedes traerlos desde tu backend)
  const customer = {
    name: "Juan Pérez",
    email: "juanperez@email.com",
    phone: "+57 300 123 4567",
    address: "Bogotá, Colombia",
  };

  return (
    <div className="min-h-screen bg-[#2B2F36] font-['Kadwa'] text-white">

      {/* Header */}
      <header className="bg-[#8C7E97] flex justify-end items-center px-8 py-4 gap-2">
        <span className="text-xl font-semibold">Customer</span>
        <button onClick={() => navigate("/customerProfile")}>
          <User size={28} />
        </button>
      </header>

      <main className="flex justify-center p-10">

        {/* Botón de regreso */}
        <button
          onClick={() => navigate("/indexCustomer")}
          className="absolute left-10 top-26 flex items-center gap-2 bg-[#8C7E97] px-4 py-2 rounded-lg hover:bg-[#77678a]"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-[#3A3F47] rounded-xl p-10 w-full max-w-2xl shadow-lg">

        
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#2B2F36] p-6 rounded-full mb-4">
              <User size={120} />
            </div>

            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <p className="text-gray-300">Customer Profile</p>
          </div>

          {/* Info */}
          <div className="space-y-4 text-lg">

            <div className="flex items-center gap-3">
              <Mail size={20} />
              <span>{customer.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={20} />
              <span>{customer.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={20} />
              <span>{customer.address}</span>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8">

            <button
              onClick={() => navigate("/editCustomer")}
              className="flex items-center gap-2 bg-[#8C7E97] px-4 py-2 rounded-lg hover:bg-[#77678a]"
            >
              <Pencil size={18} />
              Edit
            </button>

            <button
              className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
            >
              <Trash2 size={18} />
              Delete
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerProfile;