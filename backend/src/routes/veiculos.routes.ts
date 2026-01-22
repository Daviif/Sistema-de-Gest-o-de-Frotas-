import { Router, Request, Response } from 'express'
import pool from '../db'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM veiculo')
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao buscar veículos' })
  }
})

export default router
