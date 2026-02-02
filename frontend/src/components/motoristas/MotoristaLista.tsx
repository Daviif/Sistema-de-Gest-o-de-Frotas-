// src/components/motoristas/MotoristaLista.tsx
import { useState } from 'react'
import { Plus, Search, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useDrivers } from '@/hooks/useMotorista'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Driver, DriverStatus } from '@/types'

export default function DriversList() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: drivers, isLoading } = useDrivers(statusFilter)

  const filteredDrivers = drivers?.filter((d: Driver) => 
    d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.cpf.includes(searchTerm.replace(/\D/g, '')) ||
    d.cnh.includes(searchTerm.replace(/\D/g, ''))
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
          <h1 className="text-3xl font-bold text-slate-900">Motoristas</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os motoristas da frota
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Motorista
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, CPF ou CNH..."
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
              <SelectItem value={DriverStatus.ACTIVE}>Ativo</SelectItem>
              <SelectItem value={DriverStatus.ON_TRIP}>Em Viagem</SelectItem>
              <SelectItem value={DriverStatus.INACTIVE}>Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Driver List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers?.map((driver: Driver) => (
          <Card key={driver.cpf} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{driver.nome}</h3>
                <p className="text-sm text-slate-500">CPF: {formatCPF(driver.cpf)}</p>
              </div>
              <StatusBadge status={driver.status} />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">CNH:</span>
                <span className="font-medium">{formatCNH(driver.cnh)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Categoria:</span>
                <span className="font-medium">{driver.cat_cnh}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Validade CNH:</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className={`font-medium ${isCNHExpiring(driver.validade_cnh) ? 'text-red-600' : ''}`}>
                    {new Date(driver.validade_cnh).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {isCNHExpiring(driver.validade_cnh) && (
              <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                ⚠️ CNH vencendo em breve
              </div>
            )}

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

      {filteredDrivers?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhum motorista encontrado</p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: DriverStatus }) {
  const colors = {
    [DriverStatus.ACTIVE]: 'bg-green-100 text-green-700',
    [DriverStatus.ON_TRIP]: 'bg-blue-100 text-blue-700',
    [DriverStatus.INACTIVE]: 'bg-slate-100 text-slate-700',
  }

  const labels = {
    [DriverStatus.ACTIVE]: 'Ativo',
    [DriverStatus.ON_TRIP]: 'Em Viagem',
    [DriverStatus.INACTIVE]: 'Inativo',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  )
}

function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatCNH(cnh: string): string {
  return cnh.replace(/(\d{5})(\d{6})/, '$1 $2')
}

function isCNHExpiring(validade: string): boolean {
  const expiry = new Date(validade)
  const today = new Date()
  const threeMonths = new Date()
  threeMonths.setMonth(today.getMonth() + 3)
  return expiry < threeMonths && expiry > today
}