# HGU Manager

PWA pessoal para catalogar HGUs de clientes e gerenciar disponibilidade do **Magic Tool** (regra dos 7 dias).

> Uso interno — Welsete (técnico ICOMON / Vivo).

---

## Stack

- **Vite + React** (JavaScript, sem TypeScript)
- **Tailwind CSS** para estilo
- **localStorage** para persistência (sem backend, funciona offline)
- **vite-plugin-pwa** (manifest + service worker)
- **Leaflet.js** *(no Módulo 2)* para o mapa
- **GPS e câmera nativos** do navegador

---

## Como rodar

Requer **Node 18+** e **npm**.

```bash
# Instalar dependências (primeira vez)
npm install

# Servidor de desenvolvimento
npm run dev
# → abre em http://localhost:5173

# Build de produção
npm run build

# Preview do build pronto
npm run preview
```

### Testar no celular durante o dev

1. Conecte o celular na mesma rede WiFi do PC.
2. Rode `npm run dev -- --host`.
3. Abra no celular o IP do PC (ex: `http://192.168.0.10:5173`).

> GPS e câmera só funcionam em **HTTPS** ou **localhost**. Para testar no celular pela rede local, faça o build e use o preview do Vercel.

---

## Deploy no Vercel

1. Suba o projeto para o GitHub.
2. No Vercel: *Add New → Project → Import* do repositório.
3. Framework Preset: **Vite** (detectado automaticamente).
4. Build Command: `npm run build` · Output Directory: `dist`.
5. Após o deploy, abra a URL no celular e use **"Adicionar à tela inicial"** para instalar como app.

---

## Estrutura

```
src/
├── App.jsx                    Navegação simples entre telas
├── main.jsx                   Entry point React
├── index.css                  Tailwind + classes utilitárias (input-base, btn-primary, ...)
├── components/
│   ├── TextField.jsx          Input de texto com label/erro/hint
│   ├── PhotoInput.jsx         Captura de foto pela câmera (opcional)
│   └── GpsField.jsx           Botão de captura de GPS + display
├── hooks/
│   └── useGeolocation.js      Captura GPS via navigator.geolocation
├── screens/
│   ├── HomeScreen.jsx         Tela inicial (placeholder do mapa do Módulo 2)
│   └── CadastroScreen.jsx     Formulário de cadastro de HGU
└── utils/
    ├── storage.js             CRUD de HGUs em localStorage
    └── image.js               Compressão de imagem antes de salvar
```

---

## Roadmap

| Módulo | Conteúdo | Status |
|---|---|---|
| 1 | Setup PWA + Cadastro + localStorage | ✅ Concluído |
| 2 | Mapa Leaflet + pinos coloridos + geolocalização | ⏳ Próximo |
| 3 | Lógica 7 dias + botão "Usar Magic Tool" + status dinâmico | ⏳ |
| 4 | Lista + busca SSID/SLID + foto + refinamentos | ⏳ |

---

## Notas técnicas

- **localStorage limit ≈ 5 MB.** Por isso `utils/image.js` redimensiona fotos para 1024px máx + JPEG q=0.7 antes de salvar. Mesmo assim, evite cadastrar fotos demais — ~50 fotos comprimidas devem caber tranquilamente.
- **Estado salvo no celular onde o app foi instalado.** Sem sync. Limpar dados do navegador = perde tudo. Plano para o futuro: exportar JSON ou migrar para Firestore.
- **GPS exige HTTPS** em produção. Vercel já entrega HTTPS por padrão.
- **Senhas armazenadas em texto puro no localStorage.** É uma ferramenta pessoal, sem multi-usuário; mesmo assim, não use o mesmo celular compartilhado com outras pessoas para usar este app.
