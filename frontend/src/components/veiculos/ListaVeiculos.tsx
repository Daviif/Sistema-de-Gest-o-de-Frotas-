// src/components/veiculos/ListaVeiculos.tsx
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useVehicles } from '@/hooks/useVehicles'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VehicleStatus } from '@/types'

export default function VehiclesList() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: vehicles, isLoading } = useVehicles(statusFilter)

  const filteredVehicles = vehicles?.filter(v => 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Veículos</h1>
          <p className="text-slate-500 mt-1">
            Gerencie a frota de veículos
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Veículo
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por placa, modelo ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value={VehicleStatus.ACTIVE}>Ativo</SelectItem>
              <SelectItem value={VehicleStatus.ON_TRIP}>Em Viagem</SelectItem>
              <SelectItem value={VehicleStatus.MAINTENANCE}>Manutenção</SelectItem>
              <SelectItem value={VehicleStatus.INACTIVE}>Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles?.map((vehicle) => (
          <Card key={vehicle.id_veiculo} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{vehicle.placa}</h3>
                <p className="text-sm text-slate-500">{vehicle.modelo}</p>
              </div>
              <StatusBadge status={vehicle.status} />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Marca:</span>
                <span className="font-medium">{vehicle.marca}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ano:</span>
                <span className="font-medium">{vehicle.ano}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">KM Atual:</span>
                <span className="font-medium">{vehicle.km_atual.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                Detalhes
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredVehicles?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhum veículo encontrado</p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: VehicleStatus }) {
  const colors = {
    [VehicleStatus.ACTIVE]: 'bg-green-100 text-green-700',
    [VehicleStatus.ON_TRIP]: 'bg-blue-100 text-blue-700',
    [VehicleStatus.MAINTENANCE]: 'bg-amber-100 text-amber-700',
    [VehicleStatus.INACTIVE]: 'bg-slate-100 text-slate-700',
  }

  const labels = {
    [VehicleStatus.ACTIVE]: 'Ativo',
    [VehicleStatus.ON_TRIP]: 'Em Viagem',
    [VehicleStatus.MAINTENANCE]: 'Manutenção',
    [VehicleStatus.INACTIVE]: 'Inativo',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  )
}