Já que a mão na massa pesada do banco de dados fica para amanhã, vamos mapear o "Caminho Feliz" (e os tropeços) do usuário. Entender as interações de ponta a ponta é o que separa um app que as pessoas desistem de usar de um app que vira vício de produtividade.

Aqui está o mapa completo de como as interações fluem no Nano, do amanhecer ao fim do dia:

🌅 Loop 1: O Amanhecer (Entrada de Mercadoria)
Onde acontece: Aba 1 (Lista) ➔ Aba 2 (Estoque)

A Ação: O vendedor está no Ceasa ou recebendo o caminhão. Ele abre a Aba 1 (Lista), vê que precisa comprar tomate. Ele compra, desliza o dedo no card do tomate para a direita (Swipe).

A Fricção Necessária (Popup): O app pausa e pergunta: "Custo da caixa hoje?". O usuário digita "R$ 40" e confirma.

A Mágica no Fundo: O tomate some da Lista de Coleta. Na Aba 2 (Estoque), a quantidade de tomate aumenta e o preço de custo é atualizado. O sistema já sabe que qualquer tomate vendido hoje tem R$ 40 de custo base para calcular o lucro.

🤝 Loop 2: A Venda (A Mão na Roda)
Onde acontece: Aba 3 (Pedidos) ➔ Aba 2 (Estoque)

A Ação: O telefone toca. O usuário vai na Aba 3, bate no botão gigante "+ Novo Pedido". Digita "João da Mercearia", adiciona 2 caixas de tomate e marca como [💰 Fiado]. Salva.

A Mágica no Fundo: Na mesma hora, o app vai lá na Aba 2 (Estoque) e subtrai 2 caixas do "Estoque Livre" do tomate. Se o tomate estiver acabando, a tag de vidro muda instantaneamente para vermelho (🚨 2 cx LIVRE).

O Extra: O usuário clica no botão do WhatsApp no card do pedido, e o app abre o zap já com a mensagem pronta: "João, separadas 2cx de tomate. Total R$ 120. Entrega às 14h."

🚚 Loop 3: A Rua (Entrega e Imprevistos)
Onde acontece: Aba 3 (Pedidos) ➔ Aba 4 (Resumo Diário)

A Ação (Sucesso): O motorista entregou a mercadoria. O usuário toca na tag [🚚 Pendente] no card do pedido, e ela vira [✅ Entregue]. O valor desse pedido entra oficialmente no faturamento do dia na Aba 4.

A Ação (Devolução): O cliente reclamou que uma caixa de tomate estava amassada e devolveu. O usuário abre o pedido, clica em "Registrar Devolução" e remove 1 caixa.

A Mágica no Fundo: O app recalcula o valor da dívida do João, tira esse faturamento do Resumo Diário, e manda o usuário escolher: "Voltar a caixa pro Estoque" ou "Registrar como Perda".

💸 Loop 4: O Ralo e a Torneira (Financeiro)
Onde acontece: Aba 5 (Balanço)

A Ação (A Torneira - Recebendo Fiado): É sexta-feira. O João da Mercearia paga os R$ 120 que devia. O usuário vai na Aba 5, rola até "A Receber", acha o João e clica em "💵 Liquidar". Todos os pedidos pendentes do João ficam com a tag verde [💰 Pago]. O dinheiro entra no Lucro Real do mês.

A Ação (O Ralo - Despesas): O pneu do caminhão furou. O usuário clica em "+ Nova Despesa", digita "Borracharia - R$ 50". O app subtrai esses R$ 50 direto do Lucro Líquido no topo da tela. A realidade nua e crua.

🌙 Loop 5: O Reset (Fechamento do Dia)
Onde acontece: Aba 4 (Resumo Diário) ➔ Sistema todo

A Ação: Fim do expediente. O usuário revisa a Aba 4, vê que vendeu R$ 3.000 e teve R$ 100 de perdas. Ele clica no botão gigante "🌙 Fechar o Dia".

A Mágica no Fundo: O app faz a faxina:

Soma os números do dia e manda para o histórico do mês (Aba 5).

Limpa a tela de Pedidos (Aba 3) para amanhã.

Analisa o Estoque (Aba 2): O que sobrou continua lá. O que zerou volta magicamente para a Lista de Coleta (Aba 1) para ser comprado na madrugada seguinte.

Com essas interações bem definidas, a arquitetura do banco de dados flui naturalmente.