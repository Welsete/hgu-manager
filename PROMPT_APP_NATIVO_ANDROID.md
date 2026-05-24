# Prompt — App Nativo Android "HGU Manager"

> Cole este prompt na ferramenta de criação de apps Android. Ele descreve um app
> completo, offline-first e de usuário único. Adapte o que for necessário para a
> ferramenta específica que você estiver usando.

---

## Contexto e objetivo

Crie um aplicativo **nativo Android** chamado **HGU Manager**, para uso pessoal de um
técnico de instalação de fibra óptica (ICOMON / Vivo).

**Problema que resolve:** quando o app **Magic Tool** (da Vivo, usado para validar
instalações e reparos) dá erro no HGU/modem do cliente, o técnico precisa rodar a
validação como "manobra" em **outro HGU** já conhecido. A regra é que o **mesmo HGU
só pode ser reutilizado a cada 15 dias**. O app cataloga os HGUs de clientes (rede WiFi,
senhas, serial, foto, localização) e mostra no mapa quais estão **disponíveis** para uso
dentro do prazo permitido.

**Características gerais:**
- **Offline-first**: tudo funciona sem internet. Dados ficam no aparelho.
- **Usuário único**: sem login, sem backend, sem nuvem (nesta versão).
- **Português do Brasil** em toda a interface.
- **Tema escuro** (fundo grafite/slate, destaque verde-esmeralda), pensado para uso ao
  sol e economia de bateria.
- Interface **mobile-first**, botões grandes para uso com luvas/no campo.

## Stack sugerida (nativo)

- **Kotlin + Jetpack Compose** para a UI.
- **Room (SQLite)** para persistência local.
- **Google Maps SDK** ou **osmdroid (OpenStreetMap)** para o mapa.
- **FusedLocationProvider** para GPS.
- **CameraX** + acesso à galeria para fotos.
- Permissões: localização (fina), câmera, e (ver seção de recursos nativos) acesso a
  estado de WiFi.

---

## Regra de negócio — disponibilidade (os 15 dias)

Cada HGU tem um campo "último uso do Magic Tool". O status é calculado assim:

| Status | Condição | Cor |
|---|---|---|
| **Disponível** | Nunca usado **ou** último uso há **15 dias ou mais** | 🟢 Verde |
| **Quase liberando** | Último uso entre **13 e 15 dias** atrás (faltam até 2 dias) | 🟡 Amarelo |
| **Bloqueado** | Último uso há **menos de 13 dias** | 🔴 Vermelho |

O status deve ser dinâmico (recalculado pela data atual sempre que a tela abre). Mantenha o número de dias do ciclo em uma **constante única** no código, pois essa regra já mudou (era 7 dias) e pode mudar de novo.

---

## Modelo de dados (por HGU)

- **SSID** — nome da rede WiFi (obrigatório)
- **Tipo de HGU** — categoria selecionável e **editável** (ex: HGU 5, HGU 5 HPNA, HGU 6, HGU com telefone). O usuário deve poder **adicionar novos tipos** na hora, e eles ficam salvos para os próximos cadastros (opcional)
- **Senha do WiFi** (obrigatório)
- **Senha do modem** — acesso ao painel admin, ex. 192.168.15.1 (obrigatório)
- **SLID** — serial do equipamento (obrigatório)
- **Endereço** — texto (opcional)
- **Anotação** — texto livre (opcional)
- **Foto** — opcional (câmera ou galeria)
- **Localização GPS** — latitude/longitude (opcional, mas necessária para aparecer no mapa)
- **Data de cadastro** — automática
- **Último uso do Magic Tool** — data/hora, preenchida ao registrar um uso

---

## Telas e funcionalidades

### 1. Mapa (tela inicial)
- Mapa em tela cheia com **pinos coloridos** dos HGUs conforme o status (verde/amarelo/vermelho).
- **Posição atual do usuário** marcada (bolinha azul).
- Botão **"Me localizar"** que recentraliza o mapa na posição do usuário.
- Botão flutuante **"+"** para cadastrar novo HGU.
- Botão **"Lista"** no topo para abrir a lista.
- Indicador discreto **"+ N sem GPS"** quando há HGUs cadastrados sem coordenadas.
- Tocar em um pino abre um balão com SSID + status + botão "Ver detalhes".

### 2. Lista de HGUs próximos
- Lista ordenada por **distância** da posição atual (mais próximos primeiro).
- Filtros: **Todos** e **Só disponíveis** (com contagem).
- Cada item: bolinha de status, SSID, endereço e distância (em m/km).
- Tocar abre o detalhe.

### 3. Cadastro / Edição de HGU
- Formulário com todos os campos do modelo de dados.
- **Tipo de HGU**: um seletor (dropdown) com as categorias salvas + um botão **"Adicionar novo tipo"** que cria e salva uma nova categoria na hora.
- Mostrar/ocultar senhas.
- **GPS**: botão para capturar a posição atual.
- **Escolher no mapa**: abre um mapa com um **alfinete arrastável** — o usuário arrasta
  o pino (ou toca no mapa) para marcar o local exato, útil para **cadastrar um HGU sem
  estar fisicamente no local**.
- **Endereço automático**: ao capturar o GPS, o app busca o endereço (geocodificação
  reversa) e preenche o campo (editável). Também ter um botão **"Localizar pelo endereço"**
  que faz o caminho inverso (digita o endereço → acha as coordenadas e marca no mapa).
- **Foto**: dois botões — **Câmera** (traseira) e **Galeria**. Comprimir a imagem antes
  de salvar para economizar espaço.
- A mesma tela serve para **editar** um HGU existente (pré-preenchida), preservando data
  de cadastro e histórico de uso.

### 4. Detalhe do HGU
- **Card de status** colorido (Disponível / Quase liberando / Bloqueado) com contagem
  de dias.
- Exibir o **Tipo de HGU** junto dos dados.
- **Card "Último uso do Magic Tool"** com data/hora (ou "Nunca usado").
- **Botão "Usar Magic Tool agora"**: registra o uso com a data/hora atual e bloqueia o
  HGU por 15 dias. **Sempre pede confirmação.** Se o HGU ainda estiver bloqueado/amarelo,
  o botão fica laranja com aviso reforçado, mas permite usar mesmo assim (o usuário decide).
- **Botão "Corrigir último uso"**: limpa o registro de último uso (volta a disponível),
  para o caso de toque acidental.
- **Foto** com botão **"Baixar foto"** (salvar a imagem na galeria/arquivos para usar em
  outro sistema de ordem de serviço).
- **Botão "Mostrar no mapa"**: volta ao mapa centralizado neste HGU.
- **Botão "Como chegar"**: abre a navegação em **Google Maps** ou **Waze** (perguntar qual
  ao tocar), via intents nativos.
- **Botões "Copiar"** ao lado de: senha do WiFi, senha do modem, SLID, endereço e GPS
  (copiam para a área de transferência).
- Botão **Editar** e botão **Apagar** (com confirmação).

---

## Recursos NATIVOS desejados (vantagens sobre a versão web)

### A) Captura automática do WiFi conectado
Quando o técnico estiver conectado à rede do HGU do cliente, o app deve, ao cadastrar,
**preencher automaticamente**:
- **Nome da rede (SSID)** da rede WiFi atualmente conectada.
- **Senha do WiFi** atualmente conectada, se for tecnicamente possível.

> ❓ **PERGUNTA PARA VOCÊ (gerador) INVESTIGAR E RESPONDER:**
> É possível, em um app Android comum (sem root), ler **a senha** da rede WiFi conectada?
> Pelo meu entendimento, o Android bloqueia isso por segurança e só permite com root ou
> com o app sendo "device owner" (gerenciado por MDM). **Confirme o que é viável.**
> - Se a senha **não** puder ser lida: implemente pelo menos a captura automática do
>   **SSID** (com permissão de localização) e ofereça como alternativas para a senha:
>   (1) ler um **QR Code** do rótulo do modem (formato padrão `WIFI:T:WPA;S:rede;P:senha;;`)
>   e (2) preenchimento manual.
> - Deixe claro no resultado quais permissões são necessárias e quais limitações existem.

### B) Integração com o Oracle Field Service
O técnico usa o app **Oracle Field Service** para gerenciar as ordens de serviço, e esse
app contém dados úteis do cliente (como o **SLID**, dados do equipamento, endereço etc.).

> ❓ **PERGUNTA PARA VOCÊ (gerador) INVESTIGAR E RESPONDER:**
> É possível um app Android **capturar/importar automaticamente** informações do app
> **Oracle Field Service** (por exemplo o SLID do cliente e dados da OS) para pré-preencher
> o cadastro do HGU?
> Considere e me explique a viabilidade de cada caminho:
> - A Oracle expõe alguma **API pública / SDK / deep link / intent / content provider**
>   que permita essa leitura?
> - É possível via **compartilhamento** (o técnico usar "Compartilhar" no Oracle e enviar
>   para o HGU Manager, que faz o parse do texto)?
> - É possível via **Serviço de Acessibilidade** lendo a tela (e quais as implicações de
>   permissão/política da Play Store)?
> - Caso **nada** seja viável de forma confiável, diga isso claramente e mantenha o SLID
>   como campo de **preenchimento manual** (com opção de colar texto compartilhado).
> **Não invente uma integração que não exista** — prefira ser honesto sobre as limitações.

### C) Outros recursos nativos que agregam
- **GPS nativo** (mais preciso que o navegador).
- **Notificações locais**: avisar quando um HGU bloqueado **liberar** (completar 15 dias),
  para o técnico saber que voltou a ficar disponível. (Opcional, mas desejável.)
- **Intents** para abrir Waze/Google Maps na navegação.
- Funcionamento **100% offline**.

---

## Requisitos de qualidade
- Persistência local robusta (Room) — não perder dados ao fechar o app.
- Tratamento de erros amigável (permissão de GPS negada, sem internet para geocodificar etc.).
- Pedir permissões no momento certo, explicando o porquê.
- Código organizado e comentado em português.

## O que entregar
1. O app funcional com todas as telas e funções acima.
2. Um **resumo das respostas** às duas perguntas (WiFi e Oracle Field Service), dizendo
   o que foi possível implementar, o que não foi, e por quê.
3. Lista de permissões usadas e instruções de build/instalação.
