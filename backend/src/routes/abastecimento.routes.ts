import { Router, Request, Response } from 'express'
import pool from '../db'
import { asyncHandler, AppError } from '../middleware/errorHandler'
import {
  validarTipoCombustivel,
  validarValorPositivo,
  validarData
} from '../utils/validators'

const router = Router()

// ✅ GET /abastecimento - Listar todos os abastecimentos
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { id_veiculo, tipo_combustivel, data_inicio, data_fim } = req.query
  
  let query = `
    SELECT 
      a.*,
      v.placa,
      v.modelo
    FROM abastecimento a
    JOIN veiculo v ON v.id_veiculo = a.id_veiculo
    WHERE 1=1
  `
  const params: any[] = []
  let paramCount = 1
  
  if (id_veiculo) {
    query += ` AND a.id_veiculo = $${paramCount}`
    params.push(id_veiculo)
    paramCount++
  }
  
  if (tipo_combustivel) {
    query += ` AND a.tipo_combustivel = $${paramCount}`
    params.push(tipo_combustivel)
    paramCount++
  }
  
  if (data_inicio) {
    query += ` AND a.data_abast >= $${paramCount}`
    params.push(data_inicio)
    paramCount++
  }
  
  if (data_fim) {
    query += ` AND a.data_abast <= $${paramCount}`
    params.push(data_fim)
    paramCount++
  }
  
  query += ' ORDER BY a.data_abast DESC'
  
  const result = await pool.query(query, params)
  res.json(result.rows)
}))

// ✅ GET /abastecimento/:id - Buscar abastecimento por ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  const result = await pool.query(
    `SELECT 
      a.*,
      v.placa,
      v.modelo
     FROM abastecimento a
     JOIN veiculo v ON v.id_veiculo = a.id_veiculo
     WHERE a.id_abastecimento = $1`,
    [id]
  )
  
  if (result.rowCount === 0) {
    throw new AppError('Abastecimento não encontrado', 404)
  }
  
  res.json(result.rows[0])
}))

// ✅ POST /abastecimento - Criar novo abastecimento
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const {
    data_abast,
    tipo_combustivel,
    litros,
    valor_total,
    id_veiculo,
    km_abastecimento
  } = req.body

  // Validações obrigatórias
  if (!data_abast || !tipo_combustivel || !litros || !valor_total || !id_veiculo) {
    throw new AppError('Data, tipo de combustível, litros, valor e veículo são obrigatórios')
  }

  // Validar data
  if (!validarData(data_abast)) {
    throw new AppError('Data inválida')
  }

  // Validar tipo de combustível
  if (!validarTipoCombustivel(tipo_combustivel)) {
    throw new AppError('Tipo de combustível inválido (válidos: gasolina, etanol, diesel, gnv, flex)')
  }

  // Validar litros
  if (!validarValorPositivo(litros)) {
    throw new AppError('Quantidade de litros deve ser positiva')
  }

  // Validar valor
  if (!validarValorPositivo(valor_total)) {
    throw new AppError('Valor total deve ser positivo')
  }

  // Verificar se veículo existe
  const veiculoExiste = await pool.query(
    'SELECT id_veiculo, capacidade_tanque, km_atual FROM veiculo WHERE id_veiculo = $1',
    [id_veiculo]
  )

  if (veiculoExiste.rowCount === 0) {
    throw new AppError('Veículo não encontrado', 404)
  }

  const veiculo = veiculoExiste.rows[0]

  // Validar capacidade do tanque
  if (veiculo.capacidade_tanque && litros > veiculo.capacidade_tanque) {
    throw new AppError(`Quantidade de litros excede a capacidade do tanque (${veiculo.capacidade_tanque}L)`)
  }

  // Validar km se fornecido
  if (km_abastecimento !== undefined) {
    if (!validarValorPositivo(km_abastecimento)) {
      throw new AppError('Quilometragem deve ser positiva')
    }
    if (km_abastecimento < veiculo.km_atual) {
      throw new AppError('Quilometragem do abastecimento não pode ser menor que a atual do veículo')
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO abastecimento 
     (data_abast, tipo_combustivel, litros, valor_total, id_veiculo, km_abastecimento)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data_abast, tipo_combustivel.toLowerCase(), litros, valor_total, id_veiculo, km_abastecimento]
  )

  // Atualizar km do veículo se fornecido
  if (km_abastecimento) {
    await pool.query(
      'UPDATE veiculo SET km_atual = $1 WHERE id_veiculo = $2',
      [km_abastecimento, id_veiculo]
    )
  }

  res.status(201).json(rows[0])
}))

// ✅ PUT /abastecimento/:id - Atualizar abastecimento
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const {
    data_abast,
    tipo_combustivel,
    litros,
    valor_total,
    km_abastecimento
  } = req.body

  // Verificar se abastecimento existe
  const abastExiste = await pool.query(
    'SELECT * FROM abastecimento WHERE id_abastecimento = $1',
    [id]
  )

  if (abastExiste.rowCount === 0) {
    throw new AppError('Abastecimento não encontrado', 404)
  }

  // Validações
  if (data_abast && !validarData(data_abast)) {
    throw new AppError('Data inválida')
  }

  if (tipo_combustivel && !validarTipoCombustivel(tipo_combustivel)) {
    throw new AppError('Tipo de combustível inválido')
  }

  if (litros !== undefined && !validarValorPositivo(litros)) {
    throw new AppError('Quantidade de litros deve ser positiva')
  }

  if (valor_total !== undefined && !validarValorPositivo(valor_total)) {
    throw new AppError('Valor total deve ser positivo')
  }

  if (km_abastecimento !== undefined && !validarValorPositivo(km_abastecimento)) {
    throw new AppError('Quilometragem deve ser positiva')
  }

  const { rows } = await pool.query(
    `UPDATE abastecimento
     SET 
       data_abast = COALESCE($1, data_abast),
       tipo_combustivel = COALESCE($2, tipo_combustivel),
       litros = COALESCE($3, litros),
       valor_total = COALESCE($4, valor_total),
       km_abastecimento = COALESCE($5, km_abastecimento)
     WHERE id_abastecimento = $6
     RETURNING *`,
    [data_abast, tipo_combustivel?.toLowerCase(), litros, valor_total, km_abastecimento, id]
  )

  res.json(rows[0])
}))

// ✅ DELETE /abastecimento/:id - Deletar abastecimento
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const abastExiste = await pool.query(
    'SELECT * FROM abastecimento WHERE id_abastecimento = $1',
    [id]
  )

  if (abastExiste.rowCount === 0) {
    throw new AppError('Abastecimento não encontrado', 404)
  }

  await pool.query('DELETE FROM abastecimento WHERE id_abastecimento = $1', [id])
  
  res.json({ message: 'Abastecimento excluído com sucesso' })
}))

// ✅ GET /abastecimento/veiculo/:id/estatisticas - Estatísticas de abastecimento
router.get('/veiculo/:id/estatisticas', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { meses = 6 } = req.query

  const veiculoExiste = await pool.query(
    'SELECT placa, modelo FROM veiculo WHERE id_veiculo = $1',
    [id]
  )

  if (veiculoExiste.rowCount === 0) {
    throw new AppError('Veículo não encontrado', 404)
  }

  const result = await pool.query(
    `SELECT 
      COUNT(*) as total_abastecimentos,
      SUM(litros) as total_litros,
      SUM(valor_total) as total_gasto,
      AVG(valor_total / litros) as preco_medio_litro,
      tipo_combustivel
     FROM abastecimento
     WHERE id_veiculo = $1
       AND data_abast >= CURRENT_DATE - INTERVAL '${meses} months'
     GROUP BY tipo_combustivel`,
    [id]
  )

  res.json({
    veiculo: veiculoExiste.rows[0],
    periodo_meses: meses,
    estatisticas: result.rows
  })
}))

export default router