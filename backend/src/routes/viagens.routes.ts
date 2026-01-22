import { Router } from 'express'
import { simularViagem } from '../services/simulacao.service'

const router = Router()

router.post('/simular/:idVeiculo', async (req, res) => {
  try {
    const { idVeiculo } = req.params
    await simularViagem(Number(idVeiculo))
    res.status(200).json({ message: 'Viagem iniciada' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router
