import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useCreateMaintenance } from '@/hooks/useManutencao'
import { useVehicles } from '@/hooks/useVeiculos'
import { MaintenanceType, NewMaintenance } from '@/types'

type Props = { onSuccess?: () => void }

export default function ManutencaoForm({ onSuccess }: Props) {
  const [form, setForm] = useState<Partial<NewMaintenance>>({ data_man: new Date().toISOString().slice(0, 10) })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const create = useCreateMaintenance()
  const { data: vehicles } = useVehicles()

  function update<K extends keyof NewMaintenance>(key: K, value: NewMaintenance[K] | undefined) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function isValidDate(s?: string) {
    if (!s) return false
    const d = new Date(s)
    return !isNaN(d.getTime())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const required = ['data_man', 'tipo', 'descricao', 'id_veiculo'] as Array<keyof NewMaintenance>
    const newErrors: Record<string, string> = {}
    for (const key of required) {
      if (!form[key]) newErrors[key] = 'Campo obrigatório'
    }

    if (!isValidDate(String(form.data_man))) newErrors.data_man = 'Data inválida'

    if (form.valor !== undefined && form.valor !== null) {
      const v = Number(form.valor)
      if (!Number.isFinite(v) || v < 0) newErrors.valor = 'Valor deve ser >= 0'
    }

    const vehicle = vehicles?.find((v) => v.id_veiculo === Number(form.id_veiculo))
    if (form.km_manutencao !== undefined && form.km_manutencao !== null) {
      const km = Number(form.km_manutencao)
      if (!Number.isFinite(km) || km < 0) newErrors.km_manutencao = 'KM inválido'
      if (vehicle && km < (vehicle.km_atual ?? 0)) newErrors.km_manutencao = 'KM não pode ser menor que o atual do veículo'
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    const payload: NewMaintenance = {
      data_man: String(form.data_man),
      tipo: form.tipo as MaintenanceType,
      descricao: String(form.descricao),
      valor: form.valor !== undefined ? Number(form.valor) : 0,
      id_veiculo: Number(form.id_veiculo),
      km_manutencao: form.km_manutencao !== undefined ? Number(form.km_manutencao) : undefined,
      fornecedor: form.fornecedor ? String(form.fornecedor) : undefined,
    }

    try {
      await create.mutateAsync(payload)
      setForm({ data_man: new Date().toISOString().slice(0, 10) })
      onSuccess?.()
    } catch {
      // handled by hook
    }
  }

  const creating = create.status === 'pending'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label>Data</Label>
            <Input type="date" value={form.data_man || ''} onChange={(e) => update('data_man', e.target.value)} required />
            {errors.data_man && <p className="text-danger text-sm mt-1">{errors.data_man}</p>}
          </div>

          <div>
            <Label>Tipo</Label>
            <Select value={form.tipo || ''} onValueChange={(v) => update('tipo', v as MaintenanceType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MaintenanceType.PREVENTIVE}>Preventiva</SelectItem>
                <SelectItem value={MaintenanceType.CORRECTIVE}>Corretiva</SelectItem>
                <SelectItem value={MaintenanceType.PREDICTIVE}>Preditiva</SelectItem>
                <SelectItem value={MaintenanceType.REVISION}>Revisão</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-danger text-sm mt-1">{errors.tipo}</p>}
          </div>

          <div>
            <Label>Descrição</Label>
            <Input value={form.descricao || ''} onChange={(e) => update('descricao', e.target.value)} required />
            {errors.descricao && <p className="text-danger text-sm mt-1">{errors.descricao}</p>}
          </div>

          <div>
            <Label>Valor (R$)</Label>
            <Input type="number" value={form.valor ?? ''} onChange={(e) => update('valor', e.target.value ? Number(e.target.value) : undefined)} />
          </div>

          <div>
            <Label>Veículo</Label>
            <Select value={String(form.id_veiculo || '')} onValueChange={(v) => update('id_veiculo', Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles?.map((v) => (
                  <SelectItem key={v.id_veiculo} value={String(v.id_veiculo)}>{v.placa} — {v.modelo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_veiculo && <p className="text-danger text-sm mt-1">{errors.id_veiculo}</p>}
          </div>

          <div>
            <Label>KM Manutenção</Label>
            <Input type="number" value={form.km_manutencao ?? ''} onChange={(e) => update('km_manutencao', e.target.value ? Number(e.target.value) : undefined)} />
          </div>

          <div>
            <Label>Fornecedor</Label>
            <Input value={form.fornecedor || ''} onChange={(e) => update('fornecedor', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="submit" disabled={creating}>
            {creating ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Card>
    </form>
  )
}
