import { pool } from '../db'

const cidades = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Curitiba',
  'Salvador',
  'Brasília'
]

function cidadeAleatoria(excluir?: string) {
  const filtradas = cidades.filter(c => c !== excluir)
  return filtradas[Math.floor(Math.random() * filtradas.length)]
}

export async function simularViagem(idVeiculo: number) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const veiculoRes = await client.query(
      'SELECT * FROM veiculos WHERE id_veiculo = $1',
      [idVeiculo]
    )

    if (veiculoRes.rowCount === 0) {
      throw new Error('Veículo não encontrado')
    }

    const veiculo = veiculoRes.rows[0]

    if (veiculo.status === 'EM_VIAGEM') {
      throw new Error('Veículo já está em viagem')
    }

    const origem = veiculo.cidade_atual
    const destino = cidadeAleatoria(origem)
    const dataSaida = new Date()

    // cria viagem
    await client.query(
      `INSERT INTO viagens 
      (id_veiculo, cidade_origem, cidade_destino, data_saida, status)
      VALUES ($1, $2, $3, $4, 'EM_ANDAMENTO')`,
      [idVeiculo, origem, destino, dataSaida]
    )

    // atualiza veículo
    await client.query(
      `UPDATE veiculos
       SET status = 'EM_VIAGEM'
       WHERE id_veiculo = $1`,
      [idVeiculo]
    )

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
