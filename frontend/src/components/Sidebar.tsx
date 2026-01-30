import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Car,
  Users,
  Wrench,
  Fuel,
  MapPin
} from "lucide-react"

export function Sidebar() {
  const item =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-blue-600/20 hover:text-white transition"

  const active =
    "bg-blue-600 text-white shadow-lg"

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col p-4">
      <div className="mb-10">
        <h1 className="text-xl font-bold">FleetControl</h1>
        <p className="text-sm text-slate-400">Gestão de Frotas</p>
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink to="/" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/veiculos" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
          <Car size={18} /> Veículos
        </NavLink>

        <NavLink to="/motoristas" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
          <Users size={18} /> Motoristas
        </NavLink>

        <NavLink to="/manutencoes" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
          <Wrench size={18} /> Manutenções
        </NavLink>

        <NavLink to="/abastecimentos" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
          <Fuel size={18} /> Abastecimentos
        </NavLink>

        <NavLink to="/viagens" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
          <MapPin size={18} /> Viagens
        </NavLink>
      </nav>

      <div className="mt-auto text-xs text-slate-500 pt-8">
        Desenvolvido por<br />
        <strong>Davi Emílio</strong>
      </div>
    </aside>
  )
}
