import { StatCard } from "../components/StatCard"
import { Car, Users, Wrench, MapPin } from "lucide-react"

export function Dashboard() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Visão geral da sua frota</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total de Veículos"
          value={0}
          icon={<Car className="text-white" />}
          color="bg-blue-500"
        />

        <StatCard
          title="Motoristas Ativos"
          value={0}
          icon={<Users className="text-white" />}
          color="bg-emerald-500"
        />

        <StatCard
          title="Em Manutenção"
          value={0}
          icon={<Wrench className="text-white" />}
          color="bg-amber-500"
        />

        <StatCard
          title="Viagens Ativas"
          value={0}
          icon={<MapPin className="text-white" />}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-8 text-center text-slate-500">
          Nenhuma viagem registrada
        </div>

        <div className="bg-white rounded-xl shadow p-8 text-center text-slate-500">
          Nenhuma manutenção registrada
        </div>
      </div>

    </div>
  )
}

export default Dashboard