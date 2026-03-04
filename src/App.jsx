import { Routes, Route } from "react-router-dom"
import './index.css' 
import Login from "./components/login"
import Register from "./components/register"
import CustomerForm from "./components/forms/customerForm"
import TechnicianForm from "./components/forms/technicianForm"
import IndexCustomer from "./components/indexes/indexCustomer"
import IndexTechnician from "./components/indexes/indexTechnician"


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customerForm" element={<CustomerForm />} />
      <Route path="/indexCustomer" element={<IndexCustomer />} />
      <Route path="/technicianForm" element={<TechnicianForm />} />
      <Route path="/indexTechnician" element={<IndexTechnician />} />
      <Route path="*" element={<Login />} />
    </Routes>
  )
}

export default App