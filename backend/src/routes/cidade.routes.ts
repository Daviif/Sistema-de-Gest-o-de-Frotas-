import { Router, Request, Response } from 'express'
import pool from '../db'
import { asyncHandler, AppError } from '../middleware/errorHandler'
import { validarUF } from '../utils/validators'

const router = Router()

// ✅ GET /cidade - Listar todas as cidades
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { uf } = req.query
  
  let query = 'SELECT * FROM cidade'
  const params: any[] = []
  
  if (uf) {
    query += ' WHERE uf = $1'
    params.push((uf as string).toUpperCase())
  }
  
  query += ' ORDER BY nome'
  
  const result = await pool.query(query, params)
  res.json(result.rows)
}))

// ✅ GET /cidade/:id - Buscar cidade por ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  const result = await pool.query(
    'SELECT * FROM cidade WHERE id_cidade = $1',
    [id]
  )
  
  if (result.rowCount === 0) {
    throw new AppError('Cidade não encontrada', 404)
  }
  
  res.json(result.rows[0])
}))

// ✅ POST /cidade - Criar nova cidade
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { nome, uf } = req.body

  // Validações
  if (!nome || !uf) {
    throw new AppError('Nome e UF são obrigatórios')
  }

  if (!validarUF(uf)) {
    throw new AppError('UF inválida')
  }

  // Verificar se cidade já existe
  const cidadeExiste = await pool.query(
    'SELECT id_cidade FROM cidade WHERE UPPER(nome) = UPPER($1) AND uf = $2',
    [nome, uf.toUpperCase()]
  )

  if (cidadeExiste.rowCount! > 0) {
    throw new AppError('Já existe uma cidade com este nome neste estado', 409)
  }

  const { rows } = await pool.query(
    `INSERT INTO cidade (nome, uf)
     VALUES ($1, $2)
     RETURNING *`,
    [nome, uf.toUpperCase()]
  )

  res.status(201).json(rows[0])
}))

// ✅ PUT /cidade/:id - Atualizar cidade
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome, uf } = req.body

  // Verificar se cidade existe
  const cidadeExiste = await pool.query(
    'SELECT * FROM cidade WHERE id_cidade = $1',
    [id]
  )

  if (cidadeExiste.rowCount === 0) {
    throw new AppError('Cidade não encontrada', 404)
  }

  // Validar UF se fornecida
  if (uf && !validarUF(uf)) {
    throw new AppError('UF inválida')
  }

  // Verificar duplicidade
  if (nome || uf) {
    const nomeVerificar = nome || cidadeExiste.rows[0].nome
    const ufVerificar = (uf || cidadeExiste.rows[0].uf).toUpperCase()

    const duplicada = await pool.query(
      `SELECT id_cidade FROM cidade 
       WHERE UPPER(nome) = UPPER($1) AND uf = $2 AND id_cidade != $3`,
      [nomeVerificar, ufVerificar, id]
    )

    if (duplicada.rowCount! > 0) {
      throw new AppError('Já existe uma cidade com este nome neste estado', 409)
    }
  }

  const { rows } = await pool.query(
    `UPDATE cidade
     SET 
       nome = COALESCE($1, nome),
       uf = COALESCE($2, uf)
     WHERE id_cidade = $3
     RETURNING *`,
    [nome, uf?.toUpperCase(), id]
  )

  res.json(rows[0])
}))

// ✅ DELETE /cidade/:id - Deletar cidade
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  // Verificar se cidade existe
  const cidadeExiste = await pool.query(
    'SELECT * FROM cidade WHERE id_cidade = $1',
    [id]
  )

  if (cidadeExiste.rowCount === 0) {
    throw new AppError('Cidade não encontrada', 404)
  }

  // Verificar se tem viagens associadas
  const temViagens = await pool.query(
    `SELECT id_viagem FROM viagem 
     WHERE cidade_origem = $1 OR cidade_destino = $1 
     LIMIT 1`,
    [id]
  )

  if (temViagens.rowCount! > 0) {
    throw new AppError('Não é possível excluir cidade que possui viagens cadastradas', 400)
  }

  await pool.query('DELETE FROM cidade WHERE id_cidade = $1', [id])
  
  res.json({ message: 'Cidade excluída com sucesso' })
}))

// ✅ GET /cidade/uf/lista - Listar UFs disponíveis
router.get('/uf/lista', asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT DISTINCT uf FROM cidade ORDER BY uf'
  )

  res.json(result.rows.map(r => r.uf))
}))

export default router