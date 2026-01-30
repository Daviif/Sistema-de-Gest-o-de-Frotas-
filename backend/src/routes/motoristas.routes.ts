import { Router, Request, Response } from 'express'
import pool from '../db'

const router = Router()

// ✅ GET /motoristas
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM motorista ORDER BY nome`)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao buscar veículos' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  const { id_motorista,nome, cpf, cnh, cat_cnh, validade_cnh } = req.body 

  try {
    const { rows } = await pool.query(
      `INSERT INTO motorista (id_motorista,nome, cpf, cnh, cat_cnh, validade_cnh)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_motorista, nome, cpf, cnh, cat_cnh, validade_cnh]
    )
    res.status(201).json(rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar motorista' })
  }

})

export default router
