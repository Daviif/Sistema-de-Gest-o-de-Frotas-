import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useCreateVehicle } from '@/hooks/useVeiculos'
import { NewVehicle } from '@/types'

type Props = {
  onSuccess?: () => void
}

export default function VeiculosForm({ onSuccess }: Props) {
  const [form, setForm] = useState<Partial<NewVehicle>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const create = useCreateVehicle()

  function update<K extends keyof NewVehicle>(key: K, value: NewVehicle[K] | undefined) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validatePlaca(placa = '') {
    // Accept old pattern ABC-1234 and simple alphanumeric (basic sanitization)
    const p = String(placa).toUpperCase().replace(/[^A-Z0-9-]/g, '')
    const ok = /^[A-Z]{3}-?\d{4}$/.test(p) || /^[A-Z0-9]{5,8}$/.test(p)
    return { ok, placa: p }
  }

  function validateForm() {
    const required = ['placa', 'marca', 'modelo', 'ano', 'tipo'] as Array<keyof NewVehicle>
    const newErrors: Record<string, string> = {}

    for (const key of required) {
      if (!form[key]) newErrors[key] = 'Campo obrigatório'
    }

    // placa validation
    const { ok } = validatePlaca(form.placa)
    if (!ok) newErrors.placa = 'Placa inválida'

    // ano
    const ano = Number(form.ano)
    const currentYear = new Date().getFullYear()
    if (!Number.isFinite(ano) || ano < 1900 || ano > currentYear + 1) {
      newErrors.ano = 'Ano inválido'
    }

    // km and tanque
    if (form.km_atual !== undefined && form.km_atual !== null) {
      const km = Number(form.km_atual)
      if (!Number.isFinite(km) || km < 0) newErrors.km_atual = 'KM deve ser >= 0'
    }

    if (form.capacidade_tanque !== undefined && form.capacidade_tanque !== null) {
      const cap = Number(form.capacidade_tanque)
      if (!Number.isFinite(cap) || cap <= 0) newErrors.capacidade_tanque = 'Capacidade deve ser positiva'
    }

    return newErrors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const newErrors = validateForm()
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    const payload: NewVehicle = {
      placa: validatePlaca(String(form.placa)).placa,
      marca: String(form.marca),
      modelo: String(form.modelo),
      ano: Number(form.ano),
      tipo: String(form.tipo),
      km_atual: form.km_atual ? Number(form.km_atual) : undefined,
      capacidade_tanque: form.capacidade_tanque ? Number(form.capacidade_tanque) : undefined,
    }

    try {
      await create.mutateAsync(payload)
      setForm({})
      onSuccess?.()
    } catch {
      // error handled by hook toast
    }
  }

  const creating = create.status === 'pending'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label>Placa</Label>
            <Input value={form.placa || ''} onChange={(e) => update('placa', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} required />
            {errors.placa && <p className="text-danger text-sm mt-1">{errors.placa}</p>}
          </div>

          <div>
            <Label>Marca</Label>
            <Input value={form.marca || ''} onChange={(e) => update('marca', e.target.value)} required />
            {errors.marca && <p className="text-danger text-sm mt-1">{errors.marca}</p>}
          </div>

          <div>
            <Label>Modelo</Label>
            <Input value={form.modelo || ''} onChange={(e) => update('modelo', e.target.value)} required />
            {errors.modelo && <p className="text-danger text-sm mt-1">{errors.modelo}</p>}
          </div>

          <div>
            <Label>Ano</Label>
            <Input type="number" value={form.ano ?? ''} onChange={(e) => update('ano', Number(e.target.value))} required />
            {errors.ano && <p className="text-danger text-sm mt-1">{errors.ano}</p>}
          </div>

          <div>
            <Label>Tipo</Label>
            <Input value={form.tipo || ''} onChange={(e) => update('tipo', e.target.value)} required />
            {errors.tipo && <p className="text-danger text-sm mt-1">{errors.tipo}</p>}
          </div>

          <div>
            <Label>KM Atual</Label>
            <Input type="number" value={form.km_atual ?? ''} onChange={(e) => update('km_atual', Number(e.target.value))} />
          </div>

          <div>
            <Label>Capacidade do Tanque (L)</Label>
            <Input type="number" value={form.capacidade_tanque ?? ''} onChange={(e) => update('capacidade_tanque', Number(e.target.value))} />
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
