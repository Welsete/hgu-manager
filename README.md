# Well HGU

PWA local-first para catalogar dispositivos de rede e gerenciar a disponibilidade do
**botão "Validação"** sob a regra dos **15 dias** (mesmo dispositivo só pode ser
revalidado a cada 15 dias).

> Ferramenta pessoal. Todos os dados ficam **no aparelho do usuário** —
> sem servidor, sem nuvem, sem login. _Consulte os Termos de Uso dentro do app._

**Desenvolvido por [Wellerson Tavares](https://github.com/welsete)**

---

## Stack

- **Vite + React 18** (JavaScript)
- **Tailwind CSS** + tema escuro com toques neon verde/azul
- **localStorage** (persistência) + **IndexedDB** (referência do arquivo de auto-backup)
- **vite-plugin-pwa** (manifest, service worker, auto-update agressivo)
- **Leaflet + react-leaflet** (mapa)
- **OpenStreetMap / Nominatim** (tiles e geocodificação — grátis, sem API key)
- **GPS, câmera, área de transferência, File System Access API** nativos do navegador

---

## Funcionalidades

### Cadastro
- SSID, tipo de dispositivo, senha de rede, senha admin, código (serial), endereço,
  anotação, foto e localização GPS.
- Categorias de tipo editáveis (adicionar novos tipos na hora).
- **Endereço com autocomplete** enquanto digita (dropdown com sugestões do OSM).
- **Endereço ↔ GPS** automático nos dois sentidos:
  - GPS capturado → endereço preenche sozinho.
  - Endereço digitado → botão "Localizar pelo endereço" marca o ponto no mapa.
- **Alfinete arrastável**: abrir um mapa em tela cheia e posicionar o ponto manualmente
  (útil pra cadastrar sem estar no local).
- Foto via **câmera** ou **galeria**, comprimida (≤ 1024 px / JPEG q=0.7) antes de salvar.

### Mapa
- Tela inicial: pinos coloridos (verde / amarelo / vermelho) conforme regra dos 15 dias.
- Posição atual em destaque (bolinha azul).
- Botão **"Me localizar"** + botão flutuante **+ cadastrar**.
- Botão **"Mostrar no mapa"** focando um dispositivo específico (pino maior + anel pulsante,
  popup automático).
- Indicador discreto **"+ N sem GPS"** quando há dispositivos cadastrados sem coordenadas.

### Lista
- Ordenada por **distância** da posição atual (Haversine).
- Filtros: **Todos / Só disponíveis** + dropdown por **Tipo** (só mostra os tipos em uso).
- Cada item exibe status colorido, tipo, endereço e distância.
- Botão **📤 Compartilhar todos** no topo.

### Detalhe do dispositivo
- Card de status colorido + card de **última Validação** sempre visível.
- **Botão principal**: Validar agora (com confirmação; aviso reforçado se bloqueado/amarelo).
- **Corrigir último uso** (limpa o registro pra desfazer toque acidental).
- **Editar data do último uso** manualmente (datetime picker nativo).
- **Mostrar no mapa**, **Como chegar** (Google Maps / Waze, intents nativos).
- **Compartilhar dispositivo** (link via Web Share API ou clipboard fallback).
- **Baixar foto** com nome amigável (`dispositivo_<SSID>_<código>.jpg`).
- **Botões "Copiar"** ao lado de senhas, código, endereço e GPS.
- Editar todos os dados, apagar (com confirmação).

### Regra dos 15 dias

| Status | Condição | Cor |
|---|---|---|
| Disponível | Nunca utilizado ou último uso ≥ 15 dias | 🟢 verde |
| Quase liberando | Último uso entre 13 e 15 dias | 🟡 amarelo |
| Bloqueado | Último uso < 13 dias | 🔴 vermelho |

A constante `CYCLE_DAYS` em `src/utils/availability.js` centraliza o valor — mudar lá se
a regra mudar de novo.

### Compartilhamento (entre colegas)
- **Link** via Web Share API (WhatsApp, etc.) ou clipboard fallback.
- Codificação base64url no hash da URL (`/#import=...`) — sem servidor.
- A foto **não vai no link** (deixaria pesado demais); apenas dados de texto + GPS + último uso.
- Receptor abre o link → tela "Dispositivos recebidos" lista o que chegou → **Salvar** importa
  (pula duplicados por SSID + código).

### Backup
- **Manual (.json)**: Exportar gera arquivo com **TUDO** (dispositivos, fotos, categorias,
  datas). Importar restaura, pulando duplicados.
- **Automático (Chrome / Edge)**: usa **File System Access API**. O usuário escolhe o
  arquivo de backup **uma vez**; cada mudança no app dispara um save silencioso no mesmo
  arquivo (debounce de 800 ms). Status com "última sincronização há X" exibido na tela.

### Outros
- **Botão Voltar do Android** integrado ao histórico do navegador (não fecha o app à toa).
- **PWA com auto-update agressivo** (skipWaiting + clientsClaim + check a cada 60 s).
- **Funciona offline** (depois da primeira carga). GPS e câmera exigem HTTPS.
- **Termos de Uso** aceitos no primeiro acesso (modal bloqueante). Link "Termos" no rodapé
  permite consultar a qualquer momento.

---

## Rodar localmente

Requer **Node 18+** e **npm**.

```bash
# Instalar dependências (primeira vez)
npm install

# Servidor de desenvolvimento
npm run dev
# → http://localhost:5173

# Build de produção
npm run build

# Preview do build pronto (com --host pra acessar do celular pela LAN)
npm run preview -- --host
```

---

## Deploy

O projeto está configurado pra deploy direto no **Vercel**:

1. Suba o repositório no GitHub.
2. No Vercel: *Add New → Project → Import* do repo.
3. Framework Preset: **Vite** (detectado automaticamente).
4. Build Command: `npm run build` · Output Directory: `dist`.
5. Após o deploy: abra a URL no Chrome do celular e use *"Adicionar à tela inicial"* pra
   instalar como app.

---

## Estrutura do código

```
src/
├── App.jsx                    Navegação por estado + histórico do navegador
├── main.jsx                   Entry point (registra PWA + leaflet CSS)
├── pwa.js                     Registro do service worker + check periódico
├── index.css                  Tailwind + estilo (gradients, glow, brand pulse)
│
├── components/
│   ├── AddressField.jsx       Endereço c/ autocomplete, reverse e forward geocode
│   ├── CreditLink.jsx         "by Wellerson Tavares" + link "Termos"
│   ├── GpsField.jsx           Captura GPS + abrir picker de alfinete
│   ├── LocationPickerModal.jsx Mapa em tela cheia c/ pino arrastável
│   ├── MapView.jsx            Mapa Leaflet (FitBounds + RecenterOnUser + FocusController)
│   ├── NavigateButton.jsx     Como chegar (Waze / Google Maps via intents)
│   ├── PhotoInput.jsx         Câmera traseira + galeria + compressão
│   ├── TermsModal.jsx         Modal de Termos de Uso (initial / view)
│   ├── TextField.jsx          Input genérico c/ label, hint, erro
│   └── TypeSelector.jsx       Select de tipos + "Adicionar novo tipo"
│
├── hooks/
│   └── useGeolocation.js      Wrapper de navigator.geolocation
│
├── screens/
│   ├── MapaScreen.jsx         Tela inicial (mapa + botões flutuantes)
│   ├── ListaScreen.jsx        Lista por distância + filtros + backup
│   ├── CadastroScreen.jsx     Form de cadastro / edição
│   ├── DetalheScreen.jsx      Detalhe completo + ações
│   └── ImportScreen.jsx       Tela de "dispositivos recebidos via link"
│
└── utils/
    ├── availability.js        Regra dos 15 dias (CYCLE_DAYS, status, cor, label)
    ├── autoBackup.js          File System Access API + debounce + sync
    ├── backup.js              Exportar / importar .json
    ├── distance.js            Haversine + formatDistance
    ├── geocoding.js           Reverse / forward / search (Nominatim OSM)
    ├── idb.js                 Wrapper minimalista de IndexedDB
    ├── image.js               Compressão de imagem com canvas
    ├── share.js               Compartilhar via link (base64url + Web Share)
    ├── storage.js             CRUD + categorias + import / restore
    └── terms.js               Aceite dos termos de uso (localStorage)
```

---

## Limitações conhecidas

- **localStorage ~5 MB.** Imagens são reduzidas pra caber, mas se cadastrar centenas com
  foto, pode estourar. O auto-backup mitiga (escreve em arquivo real).
- **Senhas armazenadas em texto puro** no localStorage. É uma ferramenta pessoal —
  **proteja o aparelho com PIN / biometria** e não use em celular compartilhado.
- **GPS e câmera só funcionam em HTTPS** (ou localhost). Em produção, o Vercel entrega
  HTTPS automático.
- **File System Access API** (backup automático) só funciona em **Chrome / Edge**
  (versão 86+). Em Firefox / Safari iOS apenas o backup manual aparece.
- **Compartilhamento via link**: a foto não vai junto (URL ficaria gigantesca).
  Pra transferir foto, use o backup .json.

---

## Termos de uso e privacidade

O app exibe um **modal obrigatório de Termos de Uso e Isenção de Responsabilidade** no
primeiro acesso, com aceite via botão. O texto completo pode ser consultado a qualquer
momento pelo link "Termos" no rodapé das telas.

Pontos-chave:

- Todos os dados ficam exclusivamente no dispositivo do usuário.
- O desenvolvedor não tem acesso a nenhum dado.
- O usuário é o responsável pelo conteúdo cadastrado e pelo cumprimento de leis aplicáveis
  (LGPD) e políticas de seu empregador.
- Sem vínculo contratual entre usuário e desenvolvedor.

---

## Crédito

Desenvolvido por **Wellerson Tavares** — <https://github.com/welsete>
