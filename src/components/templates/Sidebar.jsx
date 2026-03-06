import { X } from "lucide-react";

const Sidebar = ({ navItems = [], isOpen, onClose }) => {
  return (
    <>
      {/* Overlay oscuro en móvil cuando el sidebar está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30
          w-64 bg-gradient-to-b from-[#0F2027] to-[#203A43]
          p-6 space-y-4
          transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:h-auto md:min-h-[calc(100vh-72px-56px)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Botón cerrar - solo en móvil */}
        <div className="flex justify-end md:hidden">
          <button onClick={onClose} aria-label="Close menu">
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Ítems de navegación */}
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick?.();
              onClose?.();
            }}
            className="block w-full text-left text-lg py-2 px-4 rounded hover:bg-[#8C7E97] transition box-border text-white"
          >
            {item.label}
          </button>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
