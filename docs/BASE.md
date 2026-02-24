Aja como um Desenvolvedor Front-end/Mobile Sênior especialista em React, TailwindCSS e UX/UI. Sua tarefa é criar o protótipo funcional de um aplicativo chamado "Nano", focado em gestão rápida para pequenos varejistas e vendedores.

O aplicativo deve ser "Mobile First" e focado em extrema velocidade de uso para quem está com as mãos ocupadas. Use dados mockados (dummy data) para ilustrar o funcionamento.

### 🎨 1. Design System (UI/UX)
O estilo visual obrigatório é **Dark Mode Glassmorphism**:
* **Background:** Cor escura sólida, mas não preta (ex: `bg-slate-900` ou um gradiente sutil escuro).
* **Cards e Componentes:** Devem parecer vidro translúcido. Use as classes do Tailwind: `bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl`.
* **Textos:** Brancos ou cinza claro (`text-slate-200`) para alto contraste.
* **Cores de Alerta (Neon/Brilhante):** * Perigo/Atenção: Vermelho/Laranja (`text-red-400`, `bg-red-500/20`).
    * Sucesso/Livre: Verde (`text-emerald-400`, `bg-emerald-500/20`).

### 🗂️ 2. Estrutura de Dados Mockados
Crie um estado global (pode usar React Context ou apenas useState no componente pai) com:
* `company`: { name: string }
* `products`: { id, name, emoji, defaultPrice, totalStock, availableStock }
* `orders`: { id, clientName, items: [], total, status: 'pendente'|'entregue', payment: 'fiado'|'pago', time }

### 📱 3. Navegação (Bottom Navigation Bar)
O app possui uma barra inferior fixa (estilo glassmorphism) com 5 abas. O conteúdo principal muda conforme a aba selecionada.
Abas: 1. Lista | 2. Estoque | 3. Pedidos | 4. Diário | 5. Balanço.

### 🚀 4. Telas para Implementar

**Tela 0: Setup / Nova Empresa (Aparece apenas na primeira vez ou ao clicar no cabeçalho que abre o perfil ai tem trocar de empresa, nova empresa ou sair


* Formulário simples: "Nome da sua Empresa".
* Seção "Cadastrar Produtos Base": Um input para o Nome, um seletor nativo de Emoji (ou apenas um input de texto para digitar o emoji), e o Preço Médio. Botão "Adicionar Produto". Botão final "Salvar e Começar".

**Aba 1: Lista de Coleta (Início do Dia)**
* Lista dos produtos que precisam ser pegos no fornecedor (ex: 🍅 Tomate Carmem: 100cx).
* **Interação:** Implemente um botão ou funcionalidade de "arrastar/swipe" no card que dê "Baixa" no item, movendo a quantidade dele para o `totalStock` e `availableStock`.

**Aba 2: Estoque & Preços do Dia**
* Cards de produtos (com efeito glassmorphism). 
* O preço deve ser um input fácil de editar rapidamente (ex: R$ 60,00/cx).
* **Lógica visual crucial:** Mostre o `availableStock` (Estoque sem destino). Se for alto/perto do vencimento, mostre uma tag vermelha "🚨 X cx LIVRES". Se estiver quase esgotado/vendido, mostre verde "✅ X cx LIVRES".

**Aba 3: Pedidos (O Coração do App)**
* No topo desta tela (NÃO na barra inferior), coloque um botão largo e destacado: `+ Novo Pedido`.
* Abaixo, a lista de cards de pedidos de hoje. Cada card tem o nome do cliente e duas tags visuais: Status (🚚 Pendente / Entregue) e Pagamento (💰 Fiado / Pago).
* Ao clicar no card, ele deve abrir um Modal detalhado mostrando os itens, horário de entrega, botão de editar e um botão "Compartilhar no WhatsApp" (que apenas gera um alert() ou console.log() com o texto resumido do pedido por enquanto).

**Aba 4: Resumo Diário**
* Mostre 3 cards grandes lado a lado (estilo dashboard): Vendas Totais, Lucro Estimado, e Perdas.
* Botão discreto para "Registrar Quebra/Perda".

**Aba 5: Balanço Mensal**
* Um resumo financeiro maior.
* Foco em uma lista chamada "A Receber (Fiado)": mostre a soma total do dinheiro que está na rua e quem são os clientes devedores, extraídos do status dos pedidos.

### 🛠️ 5. Instruções de Execução
Comece gerando o shell do aplicativo (Background, Bottom Navigation Bar) e o estado mockado. Em seguida, implemente a Aba 3 (Pedidos) e a Aba 2 (Estoque), pois são as mais complexas. Use ícones SVG simples ou uma biblioteca como lucide-react. 
Escreva o código em um arquivo único (se for possível no ambiente) ou divida em componentes claros para que eu possa testar.