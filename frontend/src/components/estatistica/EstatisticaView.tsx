import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Loading from '@/components/ui/loading'
import { useEstatisticasGerais } from '@/hooks/useEstatisticasGerais'
import { ResponsiveContainer, ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'

function formatCurrency(val: number): string {
	return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatNumber(val: number): string {
	return val.toLocaleString('pt-BR')
}

export default function EstatisticaView() {
	const [meses, setMeses] = useState(6)
	const { data, isLoading } = useEstatisticasGerais(meses)

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loading />
			</div>
		)
	}

	if (!data) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">Nenhum dado disponível</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Estatísticas</h1>
					<p className="text-muted-foreground mt-1">Indicadores consolidados de operação e custos</p>
				</div>
				<div className="w-full sm:w-48">
					<Select value={String(meses)} onValueChange={(v) => setMeses(Number(v))}>
						<SelectTrigger>
							<SelectValue placeholder="Período" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="3">Últimos 3 meses</SelectItem>
							<SelectItem value="6">Últimos 6 meses</SelectItem>
							<SelectItem value="9">Últimos 9 meses</SelectItem>
							<SelectItem value="12">Últimos 12 meses</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<p className="text-sm text-muted-foreground">Custo Operacional</p>
						<p className="text-2xl font-bold">{formatCurrency(data.resumo.custo_total_operacional)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<p className="text-sm text-muted-foreground">KM Total</p>
						<p className="text-2xl font-bold">{formatNumber(data.resumo.km_total)} km</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<p className="text-sm text-muted-foreground">Viagens Finalizadas</p>
						<p className="text-2xl font-bold">{formatNumber(data.resumo.viagens_finalizadas)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<p className="text-sm text-muted-foreground">Custo por KM</p>
						<p className="text-2xl font-bold">{formatCurrency(data.resumo.custo_por_km)}</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Custos e KM por mês</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<ComposedChart data={data.por_mes}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="mes_nome" />
								<YAxis yAxisId="left" tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
								<YAxis yAxisId="right" orientation="right" />
								<Tooltip
									formatter={(value, name) => {
										const numericValue = Number(value ?? 0)
										const key = String(name)
										if (key === 'KM') return formatNumber(numericValue)
										return formatCurrency(numericValue)
									}}
								/>
								<Legend />
								<Bar yAxisId="left" dataKey="combustivel" name="Combustível" fill="#3b82f6" stackId="custos" />
								<Bar yAxisId="left" dataKey="manutencao" name="Manutenção" fill="#f59e0b" stackId="custos" />
								<Line yAxisId="right" type="monotone" dataKey="km" name="KM" stroke="#10b981" strokeWidth={2} />
							</ComposedChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
