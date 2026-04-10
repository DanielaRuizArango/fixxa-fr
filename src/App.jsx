import { Routes, Route } from "react-router-dom"
import './index.css'
import Login from "./components/login"
import Register from "./components/register"
import CustomerForm from "./components/forms/customerForm"
import TechnicianForm from "./components/forms/technicianForm"
import IndexCustomer from "./components/indexes/indexCustomer"
import IndexTechnician from "./components/indexes/indexTechnician"
import IndexAdmin from "./components/indexes/indexAdmin"
import IndexClientAdmin from "./components/indexes/indexClientAdmin"
import IndexTechnicianAdmin from "./components/indexes/indexTechnicianAdmin"
import IndexCasesAdmin from "./components/indexes/indexCasesAdmin"
import CustomerProfile from "./components/showProfile/customerProfile"
import TechnicianProfile from "./components/showProfile/technicianProfile"
import AdminProfile from "./components/showProfile/adminProfile"
import EditCustomer from "./components/profile/editCustomer"
import EditTechnician from "./components/profile/editTechnician"
import EditAdmin from "./components/profile/editAdmin"
import ProtectedRoute from "./components/ProtectedRoute"
import ForgotPassword from "./components/forgotPassword"
import CreateCases from "./components/cases/createCases.jsx"
import AdminForm from "./components/forms/adminForm.jsx"
import CaseDetail from "./components/cases/showCases.jsx"
import ChatList from "./components/chat/ChatList.jsx"
import ChatRoom from "./components/chat/ChatRoom.jsx"

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

      <Route
        path="/case-detail/:id"
        element={
          <ProtectedRoute allowedRoles={["client", "technician", "admin"]}>
            <CaseDetail />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Administradores */}
      <Route
        path="/indexAdmin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <IndexAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adminForm"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editAdmin/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adminProfile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/indexClientAdmin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <IndexClientAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/indexTechnicianAdmin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <IndexTechnicianAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/indexCasesAdmin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <IndexCasesAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute allowedRoles={["client", "technician"]}>
            <ChatList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:id"
        element={
          <ProtectedRoute allowedRoles={["client", "technician"]}>
            <ChatRoom />
          </ProtectedRoute>
        }
      />

      {/* Cualquier otra ruta redirige al login */}
      <Route path="*" element={<Login />} />
    </Routes>
  )
}

export default App