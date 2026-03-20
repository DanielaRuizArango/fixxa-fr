import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCase = () => {
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState({
    client_id: "123",
    creator_name: "",
    title: "",
    description: "",
    modality: "remoto",
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

    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push(reader.result);
        newPreviews.push(reader.result);

        if (newImages.length === files.length) {
          setCaseData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
          }));
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Creando caso:", caseData);

    // TODO: enviar a API
    navigate("/cases");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C2526] via-[#263032] to-[#1C2526] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#262f31] rounded-3xl p-7 text-white shadow-2xl border border-[#3f4b4d]">
        <h1 className="text-3xl font-bold text-center mb-5">Crear Caso</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#c8d2d4]">Tu nombre</label>
            <input
              type="text"
              name="creator_name"
              value={caseData.creator_name}
              onChange={handleChange}
              required
              className="p-3 rounded-xl bg-[#1f2a2b] border border-[#3f4b4d]"
            />
          </div>

          {/* Título */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#c8d2d4]">Título</label>
            <input
              type="text"
              name="title"
              value={caseData.title}
              onChange={handleChange}
              required
              className="p-3 rounded-xl bg-[#1f2a2b] border border-[#3f4b4d]"
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#c8d2d4]">Descripción</label>
            <textarea
              name="description"
              value={caseData.description}
              onChange={handleChange}
              rows="4"
              required
              className="p-3 rounded-xl bg-[#1f2a2b] border border-[#3f4b4d]"
            />
          </div>

          {/* Modalidad */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#c8d2d4]">Modalidad</label>
            <select
              name="modality"
              value={caseData.modality}
              onChange={handleChange}
              className="p-3 rounded-xl bg-[#1f2a2b] border border-[#3f4b4d]"
            >
              <option value="remoto">Remoto</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>

          {/* Imágenes */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#c8d2d4]">Imágenes</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className="w-full p-2 rounded-xl bg-[#1f2a2b] text-white border border-[#3f4b4d] file:bg-[#8c7e97] file:text-white file:px-3 file:py-1 file:rounded-full focus:outline-none focus:border-[#8c7e97]"
            />

            {/* Preview */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {previews.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="preview"
                  className="w-full h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#8c7e97] hover:bg-[#a493bd]"
            >
              Crear Caso
            </button>

            <button
              type="button"
              onClick={() => navigate("/cases")}
              className="w-full py-3 rounded-xl border border-[#8c7e97]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCase;