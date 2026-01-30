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

function gerarKmFinal(km_inicial: number) {
  const kmRodado = Math.floor(Math.random() * 550 + 50)
  return km_inicial + kmRodado
}

export async function finalizarViagem(idViagem: number) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    
    const viagemRes = await client.query(
      `
      SELECT 
        id_viagem,
        id_veiculo,
        id_motorista
        km_inicial,
        status_viagem
      FROM viagem
      WHERE id_viagem = $1
      FOR UPDATE
      `,
      [idViagem]
    )

    if (viagemRes.rowCount === 0) {
      throw new Error('Viagem não encontrada')
    }

    const viagem = viagemRes.rows[0]

    if (viagem.status_viagem !== STATUS_VIAGEM.EM_ANDAMENTO) {
      throw new Error('Viagem não está em andamento')
    }

    const kmFinal = gerarKmFinal(viagem.km_inicial)

    await client.query(
       `
      UPDATE veiculo
      SET
        km_atual = $1,
        status = $2
      WHERE id_veiculo = $3
      `,
      [kmFinal, STATUS_VEICULO.ATIVO, viagem.id_veiculo]
    )

      await client.query(
      `
      UPDATE motorista
      SET status = 'ativo'
      WHERE id_motorista = $1
      `,
      [viagem.id_motorista]
    )

    await client.query(
      `
      UPDATE viagem
      SET
        km_final = $1,
        data_chegada = NOW(),
        status_viagem = $2
      WHERE id_viagem = $3
      `,
      [kmFinal, STATUS_VIAGEM.FINALIZADA, idViagem]
    )

    await client.query('COMMIT')

    return {
      id_viagem: idViagem,
      km_final: kmFinal,
      status: STATUS_VIAGEM.FINALIZADA
    }

  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

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

    if (veiculo.status !== STATUS_VEICULO.ATIVO) {
      throw new Error('Veículo não disponível para viagem')
    }

    const origemRes = await client.query(
      `SELECT id_cidade FROM cidade ORDER BY RANDOM() LIMIT 1`
    )

    const cidadeOrigem = origemRes.rows[0].id_cidade
    
    const destinoRes = await client.query(
      `
      SELECT id_cidade
      FROM cidade
      WHERE id_cidade <> $1
      ORDER BY RANDOM()
      LIMIT 1
      `,
      [cidadeOrigem]
    )

    const cidadeDestino = destinoRes.rows[0].id_cidade

    if (cidadeOrigem === cidadeDestino) {
      throw new Error('Cidade de origem e destino não podem ser iguais')
    }

    // 3️⃣ Sortear motorista
    const motoristaRes = await client.query(
      `
      SELECT M.id_motorista
      FROM motorista M
      WHERE NOT EXISTS (
        SELECT 1
        FROM viagem V
        WHERE V.id_motorista = M.id_motorista
          AND V.status_viagem = '${STATUS_VIAGEM.EM_ANDAMENTO}'
      )
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

    await client.query(
      `UPDATE motorista
      SET status = 'em_viagem'
      WHERE id_motorista = $1`,
      [idMotorista]
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
