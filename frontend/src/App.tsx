import { BrowserRouter, Routes, Route } from "react-router-dom"

import MainLayout from "./Layout/MainLayout"


import Dashboard from "./pages/Dashboard"
/*import Veiculo from "./pages/Veiculo"
import Motorista from "./pages/Motorista"
import Viagem from "./pages/Viagem"
import Cidade from "./pages/Cidade";
import Manutencao from "./pages/Manutencao"
import Abastecimento from "./pages/Abastecimento"*/

/*
<Route path="/veiculos" element={<Veiculo />} />
          <Route path="/motoristas" element={<Motorista />} />
          <Route path="/viagens" element={<Viagem />} />
          <Route path="/cidades" element={<Cidade />} />
          <Route path="/manutencoes" element={<Manutencao />} />
          <Route path="/abastecimentos" element={<Abastecimento />} />
*/
function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App