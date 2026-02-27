import { Routes, Route } from "react-router-dom"
import './index.css' 
import Login from "./components/login"
import Register from "./components/register"
import CustomerForm from "./components/customerForm"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customerForm" element={<CustomerForm />} />
      <Route path="*" element={<Login />} />
    </Routes>
  )
}

export default App