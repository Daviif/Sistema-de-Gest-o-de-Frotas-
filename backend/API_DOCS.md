# API - Gerenciador de Frota

Backend completo com validações, tratamento de erros e funcionalidades avançadas.

## 🚀 Início Rápido

```bash
cd backend
npm install
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

## 📋 Endpoints

### Health Check
```
GET /health
```
Retorna status do servidor.

---

## 🚗 Veículos

### Listar veículos
```
GET /veiculos
Query params: ?status=ativo|em_viagem|manutencao|inativo
```

### Buscar veículo
```
GET /veiculos/:id
```

### Criar veículo
```
POST /veiculos
Body: {
  "placa": "ABC1234",
  "modelo": "Scania R450",
  "marca": "Scania",
  "ano": 2023,
  "km_atual": 0,
  "capacidade_tanque": 400,
  "status": "ativo"
}
```

**Validações:**
- Placa: formato válido (ABC1234 ou ABC1D23)
- Ano: entre 1900 e ano atual + 1
- KM: valor positivo
- Status: ativo, em_viagem, manutencao, inativo

### Atualizar veículo
```
PUT /veiculos/:id
Body: campos a atualizar
```

### Deletar veículo
```
DELETE /veiculos/:id
```
- Veículos em viagem não podem ser excluídos
- Veículos com histórico são inativados ao invés de excluídos

### Histórico do veículo
```
GET /veiculos/:id/historico
```
Retorna viagens, abastecimentos e manutenções.

---

## 👨‍✈️ Motoristas

### Listar motoristas
```
GET /motoristas
Query params: ?status=ativo|em_viagem|inativo
```

### Buscar motorista
```
GET /motoristas/:cpf
```

### Criar motorista
```
POST /motoristas
Body: {
  "nome": "João Silva",
  "cpf": "12345678901",
  "cnh": "12345678901",
  "cat_cnh": "D",
  "validade_cnh": "2025-12-31",
  "status": "ativo"
}
```

**Validações:**
- CPF: validação completa com dígitos verificadores
- CNH: 11 dígitos numéricos
- Categoria: A, B, AB, C, D, E, AC, AD, AE
- Validade: data futura

### Atualizar motorista
```
PUT /motoristas/:cpf
```

### Deletar motorista
```
DELETE /motoristas/:cpf
```

### Histórico do motorista
```
GET /motoristas/:cpf/historico
```

### Motoristas disponíveis
```
GET /motoristas/disponiveis/lista
```
Retorna motoristas ativos, sem viagem em andamento e com CNH válida.

---

## 🗺️ Viagens

### Listar viagens
```
GET /viagens
Query params: 
  ?status=planejada|em_andamento|finalizada|cancelada
  &id_veiculo=123
  &cpf_motorista=12345678901
  &limit=50
```

### Viagens em andamento
```
GET /viagens/em-andamento
```

### Buscar viagem
```
GET /viagens/:id
```

### Simular viagem (aleatória)
```
POST /viagens/simular/:idVeiculo
```
Cria viagem automática com:
- Motorista aleatório disponível
- Origem e destino aleatórios
- Status: em_andamento

### Criar viagem específica
```
POST /viagens/criar
Body: {
  "id_veiculo": 1,
  "cpf_motorista": "12345678901", // opcional
  "cidade_origem": 10,       // opcional
  "cidade_destino": 20       // opcional
}
```

### Finalizar viagem
```
POST /viagens/finalizar/:idViagem
```
Retorna:
- Viagem atualizada
- KM rodados
- Combustível estimado
- Tempo de viagem

### Cancelar viagem
```
POST /viagens/cancelar/:idViagem
Body: {
  "motivo": "Problema mecânico"  // opcional
}
```

### Atualizar observações
```
PUT /viagens/:id
Body: {
  "observacoes": "Entrega realizada com sucesso"
}
```

### Estatísticas gerais
```
GET /viagens/estatisticas/geral
Query params: ?meses=6
```

### Rotas populares
```
GET /viagens/rotas/populares
Query params: ?limit=10
```

---

## ⛽ Abastecimento

### Listar abastecimentos
```
GET /abastecimento
Query params:
  ?id_veiculo=1
  &tipo_combustivel=diesel
  &data_inicio=2024-01-01
  &data_fim=2024-12-31
```

### Buscar abastecimento
```
GET /abastecimento/:id
```

### Criar abastecimento
```
POST /abastecimento
Body: {
  "data_abast": "2024-01-15",
  "tipo_combustivel": "diesel",
  "litros": 250,
  "valor_total": 1500.00,
  "id_veiculo": 1,
  "km_abastecimento": 15000  // opcional
}
```

**Validações:**
- Tipo: gasolina, etanol, diesel, gnv, flex
- Litros: valor positivo, não exceder capacidade do tanque
- Valor: positivo
- KM: não pode ser menor que KM atual do veículo

### Atualizar abastecimento
```
PUT /abastecimento/:id
```

### Deletar abastecimento
```
DELETE /abastecimento/:id
```

### Estatísticas de abastecimento
```
GET /abastecimento/veiculo/:id/estatisticas
Query params: ?meses=6
```

---

## 🔧 Manutenção

### Listar manutenções
```
GET /manutencao
Query params:
  ?id_veiculo=1
  &tipo=preventiva|corretiva|preditiva|revisao
  &data_inicio=2024-01-01
  &data_fim=2024-12-31
```

### Buscar manutenção
```
GET /manutencao/:id
```

### Criar manutenção
```
POST /manutencao
Body: {
  "data_man": "2024-01-15",
  "tipo": "preventiva",
  "descricao": "Troca de óleo e filtros",
  "valor": 500.00,
  "id_veiculo": 1,
  "km_manutencao": 15000,     // opcional
  "fornecedor": "Auto Peças",  // opcional
  "concluida": false           // opcional
}
```

**Validações:**
- Tipo: preventiva, corretiva, preditiva, revisao
- Descrição: obrigatória
- KM: não pode ser menor que KM atual do veículo

**Comportamento:**
- Se data é hoje ou futura e veículo não está em viagem, status vira "manutencao"
- Atualiza KM do veículo se fornecido

### Atualizar manutenção
```
PUT /manutencao/:id
Body: {
  "concluida": true  // volta veículo para status "ativo"
}
```

### Deletar manutenção
```
DELETE /manutencao/:id
```

### Estatísticas de manutenção
```
GET /manutencao/veiculo/:id/estatisticas
Query params: ?meses=12
```

### Manutenções pendentes
```
GET /manutencao/pendentes/lista
```

---

## 🏙️ Cidades

### Listar cidades
```
GET /cidade
Query params: ?uf=SP
```

### Buscar cidade
```
GET /cidade/:id
```

### Criar cidade
```
POST /cidade
Body: {
  "nome": "São Paulo",
  "uf": "SP"
}
```

**Validações:**
- UF: sigla válida de estado brasileiro
- Não permite duplicatas (mesma cidade e UF)

### Atualizar cidade
```
PUT /cidade/:id
```

### Deletar cidade
```
DELETE /cidade/:id
```
- Não permite excluir se houver viagens cadastradas

### Listar UFs
```
GET /cidade/uf/lista
```

---

## 🛡️ Tratamento de Erros

Todos os endpoints retornam erros padronizados:

```json
{
  "error": "Mensagem do erro",
  "status": "error"
}
```

**Códigos HTTP:**
- `200`: Sucesso
- `201`: Criado
- `400`: Erro de validação
- `404`: Não encontrado
- `409`: Conflito (duplicata)
- `500`: Erro interno

---

## 🔒 Validações Implementadas

### Veículos
- ✅ Placa válida (formato antigo e Mercosul)
- ✅ Ano entre 1900 e ano atual + 1
- ✅ KM sempre crescente
- ✅ Status válido
- ✅ Impede exclusão se em viagem
- ✅ Inativa ao invés de deletar se tem histórico

### Motoristas
- ✅ CPF válido (com dígitos verificadores)
- ✅ CNH válida (11 dígitos)
- ✅ Categoria de CNH válida
- ✅ Validade da CNH no futuro
- ✅ Não permite duplicatas (CPF/CNH)
- ✅ Impede exclusão se em viagem

### Viagens
- ✅ Veículo disponível (status ativo)
- ✅ Motorista disponível (ativo, CNH válida, não em viagem)
- ✅ Cidades diferentes
- ✅ Transações atômicas (tudo ou nada)
- ✅ Atualiza status de veículo e motorista

### Abastecimento
- ✅ Tipo de combustível válido
- ✅ Quantidade não excede tanque
- ✅ KM não pode ser menor que atual
- ✅ Valores positivos

### Manutenção
- ✅ Tipo válido
- ✅ KM não pode ser menor que atual
- ✅ Auto-gestão de status do veículo
- ✅ Marca como concluída

### Cidades
- ✅ UF válida
- ✅ Não permite duplicatas
- ✅ Impede exclusão com viagens

---

## 📊 Recursos Avançados

### Transações
Todas as operações críticas usam transações:
- Criação de viagem
- Finalização de viagem
- Cancelamento de viagem
- Criação de manutenção

### Lock Pessimista
Viagens usam `FOR UPDATE` para evitar condições de corrida.

### Estatísticas
- Por veículo
- Por motorista
- Por período
- Rotas mais utilizadas

### Histórico Completo
- Viagens do veículo/motorista
- Abastecimentos
- Manutenções
- KM rodados

---

## 🧪 Testando a API

### Exemplo: Fluxo completo

1. **Criar cidade de origem**
```bash
curl -X POST http://localhost:3001/cidade \
  -H "Content-Type: application/json" \
  -d '{"nome": "São Paulo", "uf": "SP"}'
```

2. **Criar cidade de destino**
```bash
curl -X POST http://localhost:3001/cidade \
  -H "Content-Type: application/json" \
  -d '{"nome": "Rio de Janeiro", "uf": "RJ"}'
```

3. **Criar veículo**
```bash
curl -X POST http://localhost:3001/veiculos \
  -H "Content-Type: application/json" \
  -d '{
    "placa": "ABC1234",
    "modelo": "Scania R450",
    "marca": "Scania",
    "ano": 2023,
    "capacidade_tanque": 400
  }'
```

4. **Criar motorista**
```bash
curl -X POST http://localhost:3001/motoristas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "12345678901",
    "cnh": "12345678901",
    "cat_cnh": "D",
    "validade_cnh": "2025-12-31"
  }'
```

5. **Simular viagem**
```bash
curl -X POST http://localhost:3001/viagens/simular/1
```

6. **Finalizar viagem**
```bash
curl -X POST http://localhost:3001/viagens/finalizar/1
```

---

## 🐛 Debug

Logs são exibidos no console:
- Requisições HTTP
- Queries SQL (se habilitado)
- Erros detalhados

---

## 📝 Notas

- Todas as datas devem estar no formato ISO: `YYYY-MM-DD`
- KM sempre em números inteiros
- Valores monetários em decimal (ex: 1500.50)
- CPF/CNH podem ter formatação, serão limpos automaticamente
- Placas podem ter hífen, serão limpas automaticamente