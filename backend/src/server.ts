import express from 'express'
import cors from 'cors'
import veiculosRoutes from './routes/veiculos.routes'
import viagensRoutes from './routes/viagens.routes'
import abastecimentoRoutes from './routes/abastecimento.routes'
import cidadeRoutes from './routes/cidade.routes'
import motoristasRoutes from './routes/motoristas.routes'
import manutencaoRoutes from './routes/manutencao.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/veiculos', veiculosRoutes)
app.use('/viagens', viagensRoutes)
app.use('/abastecimento', abastecimentoRoutes)
app.use('/cidade', cidadeRoutes)
app.use('/motoristas', motoristasRoutes)
app.use('/manutencao', manutencaoRoutes)

app.listen(3001, () => {
  console.log('Servidor backend rodando na porta 3001')
})
