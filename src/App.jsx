import { Routes, Route } from "react-router-dom"
import './index.css'
import Login from "./components/login"
import Register from "./components/register"
import CustomerForm from "./components/forms/customerForm"
import TechnicianForm from "./components/forms/technicianForm"
import IndexCustomer from "./components/indexes/indexCustomer"
import IndexTechnician from "./components/indexes/indexTechnician"
import CustomerProfile from "./components/showProfile/customerProfile"
import ProtectedRoute from "./components/ProtectedRoute"


function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customerForm" element={<CustomerForm />} />
      <Route path="/technicianForm" element={<TechnicianForm />} />
      <Route
        path="/indexCustomer"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <IndexCustomer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customerProfile"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <CustomerProfile />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - solo técnicos */}
      <Route
        path="/indexTechnician"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <IndexTechnician />
          </ProtectedRoute>
        }
      />

      {/* Cualquier otra ruta redirige al login */}
      <Route path="*" element={<Login />} />
    </Routes>
  )
}

export default App