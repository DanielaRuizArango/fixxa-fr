import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api";

const CreateCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [caseData, setCaseData] = useState({
    title: "",
    description: "",
    images: [],
  });

  const [previews, setPreviews] = useState([]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCaseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Almacenar los archivos reales para el FormData
    setCaseData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    // Generar previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", caseData.title);
    formData.append("description", caseData.description);
    
    // Laravel espera un array de archivos: images[]
    caseData.images.forEach((file) => {
      formData.append("images[]", file);
    });

    try {
      await fetchData("/client/cases", {
        method: "POST",
        body: formData,
      });

      // Navegar al index de casos tras éxito
      navigate("/indexCustomer");
    } catch (err) {
      setError(err.message || "Error al crear el caso de servicio.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C2526] via-[#263032] to-[#1C2526] flex items-center justify-center p-4 py-10 font-['Kadwa']">
      <div className="w-full max-w-lg bg-[#262f31] rounded-3xl p-7 text-white shadow-2xl border border-[#3f4b4d]">
        <h1 className="text-3xl font-bold text-center mb-5">Crear Nuevo Caso</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Título */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#c8d2d4]">Título del Caso</label>
            <input
              type="text"
              name="title"
              value={caseData.title}
              onChange={handleChange}
              placeholder="Ej: Falla en equipo de refrigeración"
              required
              disabled={loading}
              className="p-3 rounded-xl bg-[#1f2a2b] border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none"
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#c8d2d4]">Descripción del problema</label>
            <textarea
              name="description"
              value={caseData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe detalladamente lo que sucede..."
              required
              disabled={loading}
              className="p-3 rounded-xl bg-[#1f2a2b] border border-[#3f4b4d] focus:border-[#8c7e97] focus:outline-none resize-none"
            />
          </div>

          {/* Imágenes */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#c8d2d4]">Adjuntar Imágenes (opcional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              disabled={loading}
              className="w-full p-2 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] file:bg-[#8c7e97] file:text-white file:px-3 file:py-1 file:rounded-full focus:outline-none focus:border-[#8c7e97]"
            />

            {/* Preview */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {previews.map((img, index) => (
                <div key={index} className="relative group">
                   <img
                    src={img}
                    alt="preview"
                    className="w-full h-20 object-cover rounded-lg border border-white/10"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl bg-[#8c7e97] text-white font-bold transition ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#a493bd] shadow-lg shadow-[#8c7e97]/20'}`}
            >
              {loading ? "Creando..." : "Enviar Caso"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/indexCustomer")}
              className="w-full py-3 rounded-xl border border-[#8c7e97] text-[#8c7e97] hover:bg-white/5 transition"
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCase;