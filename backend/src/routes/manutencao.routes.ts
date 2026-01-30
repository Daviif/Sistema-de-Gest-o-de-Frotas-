import { Router, Request, Response } from 'express'
import pool from '../db'

const router = Router()

// ✅ GET /manutencao
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM manutencao')
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao buscar manutenções' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  const { id_manutencao, data_man, tipo, descricao, valor, id_veiculo } = req.body 

  try {
    const { rows } = await pool.query(
      `INSERT INTO manutencao (id_manutencao, data_man, tipo, descricao, valor, id_veiculo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_manutencao, data_man, tipo, descricao, valor, id_veiculo]
    )
    res.status(201).json(rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar manutenção' })
  }

})

export default router
