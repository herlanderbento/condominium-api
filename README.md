<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# API de Condomínio

API para gerenciamento de boletos e lotes de um condomínio.

## Requisitos

- Node.js (v14 ou superior)
- PostgreSQL
- npm ou yarn

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone git@github.com:herlanderbento/condominium-api.git
cd condominium-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=condominium
PORT=3000
```

4. Execute as migrações:
```bash
npm run migrate
```

5. Inicie o servidor:
```bash
npm run start:dev
```

## Estrutura do Projeto

- `src/` - Código fonte
  - `bills/` - Módulo de boletos
  - `lots/` - Módulo de lotes
  - `config/` - Configurações

## Rotas da API

### Boletos

- `GET /bills` - Lista todos os boletos
  - Query params:
    - `name`: Filtra por nome
    - `valor_inicial`: Valor mínimo
    - `valor_final`: Valor máximo
    - `id_lote`: ID do lote
    - `relatorio=1`: Gera relatório em PDF

- `POST /bills/import-csv` - Importa boletos de um arquivo CSV
  - Form data:
    - `file`: Arquivo CSV

- `POST /bills/split-pdf` - Divide um PDF de boletos em arquivos individuais
  - Form data:
    - `file`: Arquivo PDF

### Lotes

- `GET /lots` - Lista todos os lotes
- `GET /lots/:id` - Busca um lote por ID
- `GET /lots/check/required` - Verifica se os lotes necessários existem
- `POST /lots/create/required` - Cria os lotes necessários

## Collection do Postman

Importe a collection `Condominium API.postman_collection.json` no Postman para ter acesso a todas as rotas com exemplos de requisição.

## Observações

- Os PDFs gerados são salvos na pasta `reports/`
- Os PDFs divididos são salvos na pasta `temp_pdfs/`
- O sistema mantém um mapeamento entre números de unidade externos e IDs de lotes internos
- Os lotes são criados automaticamente se não existirem ao importar boletos
