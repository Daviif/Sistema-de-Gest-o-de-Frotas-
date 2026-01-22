import { useEffect, useState } from 'react'
import './App.css'

interface Veiculo {
  id_veiculo: number
  placa: string
  marca: string
  modelo: string
  ano: number
  tipo: string
  status: string
}


function App() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])

    useEffect(() => {
  fetch('http://localhost:3001/veiculos')
    .then(response => response.json())
    .then(data => setVeiculos(data))
    .catch(error => console.error('Erro ao buscar veículos:', error))
}, [])

    return (
      <div>
        <h1>Gerenciador de Frota</h1>
        <table border={1}>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ano</th>
            <th>Tipo</th>
            <th>Status</th>
          </tr>
        </thead>
          <tbody>
            {veiculos.map(veiculo => (
              <tr key={veiculo.id_veiculo}>
              <td>{veiculo.placa}</td>
              <td>{veiculo.marca}</td>
              <td>{veiculo.modelo}</td>
              <td>{veiculo.ano}</td>
              <td>{veiculo.tipo}</td>
              <td>{veiculo.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )     
}

export default App
