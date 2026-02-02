// src/components/manutencao/ManutencaoLista.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Wrench, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { Maintenance, MaintenanceType } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function MaintenanceList() {
  const [typeFilter, setTypeFilter] = useState<string>('')
  
  const { data: maintenances, isLoading } = useQuery({
    queryKey: ['maintenances', typeFilter],
    queryFn: async () => {
      const { data } = await api.get<Maintenance[]>('/manutencao', {
        params: typeFilter ? { tipo: typeFilter } : undefined
      })
      return data
    },
  })

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
          <h1 className="text-3xl font-bold text-slate-900">Manutenções</h1>
          <p className="text-slate-500 mt-1">
            Gerencie as manutenções da frota
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Manutenção
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value={MaintenanceType.PREVENTIVE}>Preventiva</SelectItem>
              <SelectItem value={MaintenanceType.CORRECTIVE}>Corretiva</SelectItem>
              <SelectItem value={MaintenanceType.PREDICTIVE}>Preditiva</SelectItem>
              <SelectItem value={MaintenanceType.REVISION}>Revisão</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Maintenance List */}
      <div className="space-y-4">
        {maintenances?.map((maintenance) => (
          <Card key={maintenance.id_manutencao} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${maintenance.concluida ? 'bg-green-50' : 'bg-amber-50'}`}>
                  {maintenance.concluida ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Wrench className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{maintenance.descricao}</h3>
                    <TypeBadge type={maintenance.tipo} />
                    {maintenance.concluida && (
                      <Badge className="bg-green-100 text-green-700">
                        Concluída
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {maintenance.placa} - {maintenance.modelo}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500">Data</p>
                  <p className="font-medium">
                    {new Date(maintenance.data_man).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500">Valor</p>
                  <p className="font-medium">
                    R$ {maintenance.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {maintenance.km_manutencao && (
                <div>
                  <p className="text-slate-500">KM</p>
                  <p className="font-medium">{maintenance.km_manutencao.toLocaleString('pt-BR')}</p>
                </div>
              )}

              {maintenance.fornecedor && (
                <div>
                  <p className="text-slate-500">Fornecedor</p>
                  <p className="font-medium">{maintenance.fornecedor}</p>
                </div>
              )}
            </div>

            {!maintenance.concluida && (
              <div className="flex gap-2 mt-4">
                <Button variant="default" size="sm">
                  Marcar como Concluída
                </Button>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {maintenances?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhuma manutenção encontrada</p>
        </div>
      )}
    </div>
  )
}

function TypeBadge({ type }: { type: MaintenanceType }) {
  const colors = {
    [MaintenanceType.PREVENTIVE]: 'bg-blue-100 text-blue-700',
    [MaintenanceType.CORRECTIVE]: 'bg-red-100 text-red-700',
    [MaintenanceType.PREDICTIVE]: 'bg-purple-100 text-purple-700',
    [MaintenanceType.REVISION]: 'bg-amber-100 text-amber-700',
  }

  const labels = {
    [MaintenanceType.PREVENTIVE]: 'Preventiva',
    [MaintenanceType.CORRECTIVE]: 'Corretiva',
    [MaintenanceType.PREDICTIVE]: 'Preditiva',
    [MaintenanceType.REVISION]: 'Revisão',
  }

  return (
    <Badge className={colors[type]}>
      {labels[type]}
    </Badge>
  )
}