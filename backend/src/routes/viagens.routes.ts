import { Router } from 'express'
import { pool } from '../db'
import { simularViagem } from '../services/simulacao.service'

const router = Router()

// ✅ GET /viagens
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        v.id_viagem,
        ve.placa,
        ve.modelo,
        c1.nome AS origem,
        c2.nome AS destino,
        v.data_saida,
        v.data_chegada,
        v.status_viagem
      FROM viagem v
      JOIN veiculo ve ON ve.id_veiculo = v.id_veiculo
      JOIN cidade c1 ON c1.id_cidade = v.cidade_origem
      JOIN cidade c2 ON c2.id_cidade = v.cidade_destino
      ORDER BY v.id_viagem DESC
    `)

    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar viagens' })
  }
})

// ✅ POST /viagens/simular/:idVeiculo
router.post('/simular/:idVeiculo', async (req, res) => {
  try {
    const viagem = await simularViagem(Number(req.params.idVeiculo))
    res.status(201).json(viagem)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router
