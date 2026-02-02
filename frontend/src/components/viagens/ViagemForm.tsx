import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { useCreateTrip } from '@/hooks/useViagem'
import { useAvailableDrivers } from '@/hooks/useMotorista'
import { useVehicles } from '@/hooks/useVeiculos'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { NewTrip, City } from '@/types'

type Props = { onSuccess?: () => void }

export default function ViagemForm({ onSuccess }: Props) {
  const [form, setForm] = useState<Partial<NewTrip>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const create = useCreateTrip()
  const { data: vehicles } = useVehicles()
  const { data: drivers } = useAvailableDrivers()

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data } = await api.get('/cidade')
      return data
    }
  })

  function update<K extends keyof NewTrip>(key: K, value: NewTrip[K] | undefined) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    if (!form.id_veiculo) {
      setErrors({ id_veiculo: 'Veículo obrigatório' })
      return
    }

    if (form.cidade_origem && form.cidade_destino && Number(form.cidade_origem) === Number(form.cidade_destino)) {
      setErrors({ cidade_destino: 'Cidade destino deve ser diferente da origem' })
      return
    }

    const payload: NewTrip = {
      id_veiculo: Number(form.id_veiculo),
      cpf_motorista: form.cpf_motorista || undefined,
      cidade_origem: form.cidade_origem ? Number(form.cidade_origem) : undefined,
      cidade_destino: form.cidade_destino ? Number(form.cidade_destino) : undefined,
    }

    try {
      await create.mutateAsync(payload)
      setForm({})
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
            <label className="text-sm font-medium mb-1 block">Veículo</label>
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
            <label className="text-sm font-medium mb-1 block">Motorista (opcional)</label>
            <Select value={form.cpf_motorista || ''} onValueChange={(v) => update('cpf_motorista', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motorista" />
              </SelectTrigger>
              <SelectContent>
                {drivers?.map((d) => (
                  <SelectItem key={d.cpf} value={d.cpf}>{d.nome} — {d.cpf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Cidade Origem (opcional)</label>
            <Select value={String(form.cidade_origem || '')} onValueChange={(v) => update('cidade_origem', Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade de origem" />
              </SelectTrigger>
              <SelectContent>
                {cities?.map((c: City) => (
                  <SelectItem key={c.id_cidade} value={String(c.id_cidade)}>{c.nome} - {c.uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Cidade Destino (opcional)</label>
            <Select value={String(form.cidade_destino || '')} onValueChange={(v) => update('cidade_destino', Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade destino" />
              </SelectTrigger>
              <SelectContent>
                {cities?.map((c: City) => (
                  <SelectItem key={c.id_cidade} value={String(c.id_cidade)}>{c.nome} - {c.uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="submit" disabled={creating}>
            {creating ? 'Salvando...' : 'Criar Viagem'}
          </Button>
        </div>
      </Card>
    </form>
  )
}
