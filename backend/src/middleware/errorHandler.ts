import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  
  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Erro:', error)

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      status: 'error'
    })
  }

  // Erros do PostgreSQL
  if (error.name === 'QueryFailedError' || (error as any).code) {
    const pgError = error as any
    
    // Violação de chave única
    if (pgError.code === '23505') {
      return res.status(409).json({
        error: 'Registro duplicado',
        details: pgError.detail,
        status: 'error'
      })
    }
    
    // Violação de chave estrangeira
    if (pgError.code === '23503') {
      return res.status(400).json({
        error: 'Referência inválida',
        details: pgError.detail,
        status: 'error'
      })
    }
    
    // Violação de constraint
    if (pgError.code === '23514') {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: pgError.detail,
        status: 'error'
      })
    }
  }

  // Erro genérico
  return res.status(500).json({
    error: 'Erro interno do servidor',
    status: 'error'
  })
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}