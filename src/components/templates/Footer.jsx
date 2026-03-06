const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#0F2027] to-[#203A43] text-white text-center py-4 text-sm">
      <span className="opacity-70">
        © {new Date().getFullYear()} <span className="font-semibold opacity-100">Fixxa</span> — All rights reserved
      </span>
    </footer>
  );
};

export default Footer;
