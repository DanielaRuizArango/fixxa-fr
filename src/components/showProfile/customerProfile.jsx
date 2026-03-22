import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, User, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchData('/client/me');
        setData(response.data);
      } catch (err) {
        setError("No se pudo cargar la información del perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <MainLayout roleName="Customer" profileRoute="/customerProfile">
        <div className="flex flex-col items-center justify-center pt-20">
          <div className="w-12 h-12 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-300">Cargando perfil...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout roleName="Customer" profileRoute="/customerProfile">
        <div className="text-center pt-20 font-['Kadwa']">
          <p className="text-red-400 mb-4">{error || "Error al cargar datos."}</p>
          <button onClick={() => navigate("/indexCustomer")} className="text-[#8C7E97] hover:underline">
            Volver al inicio
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout roleName="Customer" profileRoute="/customerProfile">

      {/* Botón de regreso */}
      <button
        onClick={() => navigate("/indexCustomer")}
        className="absolute left-10 top-6 flex items-center gap-2 bg-[#8C7E97] px-4 py-2 rounded-lg hover:bg-[#77678a] transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="flex justify-center pt-10 px-4">
        <div className="bg-[#3A3F47] rounded-xl p-8 md:p-10 w-full max-w-2xl shadow-lg border border-white/5">

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#2B2F36] p-1 rounded-full mb-4 border-2 border-[#8C7E97]">
              {data.image ? (
                <img 
                  src={data.image.startsWith('http') ? data.image : `${import.meta.env.VITE_API_STORAGE_URL || ''}/${data.image}`} 
                  alt={data.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                />
              ) : (
                <div className="p-6 md:p-8">
                  <User size={80} />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold">{data.name}</h1>
            <p className="text-[#8C7E97] font-medium">Customer Profile</p>
          </div>

          {/* Info */}
          <div className="space-y-4 text-lg">

            <div className="flex items-center gap-3 bg-[#2B2F36]/50 p-3 rounded-lg">
              <Mail size={20} className="text-[#8C7E97]" />
              <span className="text-sm md:text-base">{data.email}</span>
            </div>

            <div className="flex items-center gap-3 bg-[#2B2F36]/50 p-3 rounded-lg">
              <Phone size={20} className="text-[#8C7E97]" />
              <span className="text-sm md:text-base">{data.phone || 'No especificado'}</span>
            </div>

            <div className="flex items-center gap-3 bg-[#2B2F36]/50 p-3 rounded-lg">
              <MapPin size={20} className="text-[#8C7E97]" />
              <span className="text-sm md:text-base">{data.city}{data.address ? `, ${data.address}` : ''}</span>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8">

            <button
              onClick={() => navigate("/editCustomer")}
              className="flex items-center gap-2 bg-[#8C7E97] px-6 py-2 rounded-lg hover:bg-[#77678a] transition"
            >
              <Pencil size={18} />
              Edit
            </button>

            <button className="flex items-center gap-2 bg-red-500/80 px-6 py-2 rounded-lg hover:bg-red-600 transition">
              <Trash2 size={18} />
              Delete
            </button>

          </div>
        </div>
      </div>

    </MainLayout>
  );
};

export default CustomerProfile;