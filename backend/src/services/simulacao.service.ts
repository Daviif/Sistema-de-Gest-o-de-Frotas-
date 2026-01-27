import { pool } from '../db'

const STATUS_VEICULO = {
  ATIVO: 'ativo',
  EM_VIAGEM: 'em_viagem',
  MANUTENCAO: 'manutencao',
  INATIVO: 'inativo'
} as const

const STATUS_VIAGEM = {
  PLANEJADA: 'planejada',
  EM_ANDAMENTO: 'em_andamento',
  FINALIZADA: 'finalizada'
} as const

export async function simularViagem(idVeiculo: number) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1️⃣ Buscar veículo
    const veiculoRes = await client.query(
      `
      SELECT status, km_atual
      FROM veiculo
      WHERE id_veiculo = $1
      `,
      [idVeiculo]
    )

    if (veiculoRes.rowCount === 0) {
      throw new Error('Veículo não encontrado')
    }

    const veiculo = veiculoRes.rows[0]

    if (veiculo.status === STATUS_VEICULO.EM_VIAGEM) {
      throw new Error('Veículo já está em viagem')
    }

    // 2️⃣ Sortear cidades (origem e destino diferentes)
    const cidadesRes = await client.query(
      `
      SELECT id_cidade
      FROM cidade
      ORDER BY RANDOM()
      LIMIT 2
      `
    )

    if (cidadesRes.rowCount < 2) {
      throw new Error('Cidades insuficientes para simulação')
    }

    const cidadeOrigem = cidadesRes.rows[0].id_cidade
    const cidadeDestino = cidadesRes.rows[1].id_cidade

    // 3️⃣ Sortear motorista
    const motoristaRes = await client.query(
      `
      SELECT id_motorista
      FROM motorista
      ORDER BY RANDOM()
      LIMIT 1
      `
    )

    if (motoristaRes.rowCount === 0) {
      throw new Error('Nenhum motorista cadastrado')
    }

    const idMotorista = motoristaRes.rows[0].id_motorista

    // 4️⃣ Inserir viagem
    const viagemRes = await client.query(
      `
      INSERT INTO viagem
      (
        id_veiculo,
        id_motorista,
        cidade_origem,
        cidade_destino,
        data_saida,
        status_viagem,
        km_inicial
      )
      VALUES ($1, $2, $3, $4, NOW(), 'em_andamento', $5)
      RETURNING *
      `,
      [
        idVeiculo,
        idMotorista,
        cidadeOrigem,
        cidadeDestino,
        veiculo.km_atual
      ]
    )

    // 5️⃣ Atualizar status do veículo
    await client.query(
      `
      UPDATE veiculo
      SET status = '${STATUS_VEICULO.EM_VIAGEM}'
      WHERE id_veiculo = $1
      `,
      [idVeiculo]
    )

    await client.query('COMMIT')
    return viagemRes.rows[0]

  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
