import { Router, Request, Response } from 'express'
import pool from '../db'

const router = Router()

// ✅ GET /cidade
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM cidade')
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao buscar cidade' })
  }
})
    
router.post('/', async (req: Request, res: Response) => {
  const { id_cidade, nome, uf } = req.body 

  try {
    const { rows } = await pool.query(
      `INSERT INTO cidade (id_cidade, nome, uf)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_cidade, nome, uf]
    )
    res.status(201).json(rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cidade' })
  }

})

export default router
