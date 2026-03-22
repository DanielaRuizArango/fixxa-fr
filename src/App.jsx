import { Routes, Route } from "react-router-dom"
import './index.css'
import Login from "./components/login"
import Register from "./components/register"
import CustomerForm from "./components/forms/customerForm"
import TechnicianForm from "./components/forms/technicianForm"
import IndexCustomer from "./components/indexes/indexCustomer"
import IndexTechnician from "./components/indexes/indexTechnician"
import CustomerProfile from "./components/showProfile/customerProfile"
import TechnicianProfile from "./components/showProfile/technicianProfile"
import EditCustomer from "./components/profile/editCustomer"
import EditTechnician from "./components/profile/editTechnician"
import ProtectedRoute from "./components/ProtectedRoute"
import ForgotPassword from "./components/forgotPassword"
import CreateCases from "./components/cases/createCases"


function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customerForm" element={<CustomerForm />} />
      <Route path="/technicianForm" element={<TechnicianForm />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ForgotPassword />} />
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

      <Route
        path="/editCustomer"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <EditCustomer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/createCases"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <CreateCases />
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

      <Route
        path="/technicianProfile"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/editTechnician"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <EditTechnician />
          </ProtectedRoute>
        }
      />

      {/* Cualquier otra ruta redirige al login */}
      <Route path="*" element={<Login />} />
    </Routes>
  )
}

export default App