import { Router, Request, Response } from 'express'
import pool from '../db'

const router = Router()

// ✅ GET /abastecimento
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM abastecimento')
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao buscar abastecimentos' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  const { id_abastecimento, data_abast, tipo_combustivel, litros, valor_total, id_veiculo } = req.body 

  try {
    const { rows } = await pool.query(
      `INSERT INTO abastecimento (id_abastecimento, data_abast, tipo_combustivel, litros, valor_total, id_veiculo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_abastecimento, data_abast, tipo_combustivel, litros, valor_total, id_veiculo]
    )
    res.status(201).json(rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar abastecimento' })
  }

})

export default router
