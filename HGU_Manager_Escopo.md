# HGU Manager — Escopo do Projeto

## Contexto

Aplicativo criado para uso de Welsete, técnico de instalação de fibra óptica na ICOMON (prestadora Vivo). O app resolve um problema de campo: quando o **Magic Tool** (app da Vivo para validar instalações/reparos) não consegue rodar no HGU do cliente por bug, é necessário rodar em outro HGU como manobra. Essa manobra só pode ser feita no mesmo HGU a cada **7 dias**.

O app serve para catalogar HGUs de clientes (com WiFi, senha do modem, SLID e localização) e mostrar no mapa quais estão disponíveis para uso no Magic Tool dentro do período permitido.

---

## Decisões Tomadas

- **Usuário único** no MVP (só Welsete) — sem backend, sem autenticação
- Foto do HGU é **opcional**
- Sem histórico de usos anteriores
- Prazo de disponibilidade: **7 dias**

---

## Stack Escolhida

| Tecnologia | Função |
|---|---|
| **React** | Framework principal (PWA) |
| **localStorage** | Persistência de dados local, sem custo, funciona offline |
| **Leaflet.js** | Mapa com pinos dos HGUs |
| **GPS nativo do browser** | Captura localização no cadastro e posição atual |
| **Câmera nativa** | Upload de foto opcional via browser mobile |
| **Vercel** | Deploy do PWA |

> Quando quiser expandir para o time no futuro, a migração para Firebase Firestore é direta.

---

## Telas do App

| Tela | Descrição |
|---|---|
| **Mapa** | Pinos coloridos dos HGUs ao redor com status visual |
| **Cadastro** | Formulário completo com GPS automático |
| **Detalhe do HGU** | Todos os dados + botão "Usar Magic Tool agora" |
| **Lista** | Todos os HGUs com status e distância da posição atual |

---

## Dados Cadastrados por HGU

| Campo | Detalhe |
|---|---|
| **SSID** | Nome da rede WiFi |
| **Senha WiFi** | Senha para conectar na rede do cliente |
| **Senha do modem** | Acesso ao painel admin (ex: `192.168.15.1`) |
| **SLID** | Serial do equipamento para identificação e reparo |
| **Foto** | Opcional — capturada pela câmera do celular |
| **Localização GPS** | Capturada automaticamente no momento do cadastro |
| **Data de cadastro** | Registrada automaticamente |
| **Último uso Magic Tool** | Registrado ao clicar em "Usar Magic Tool agora" |

---

## Regras de Negócio — Disponibilidade

| Status | Condição | Cor no Mapa |
|---|---|---|
| **Disponível** | Nunca usado ou último uso há mais de 7 dias | 🟢 Verde |
| **Quase liberando** | Entre 5 e 7 dias do último uso | 🟡 Amarelo |
| **Bloqueado** | Usado há menos de 5 dias | 🔴 Vermelho |

---

## Roadmap Sugerido

```
Semana 1 → Setup do projeto React PWA + Tela de Cadastro + localStorage
Semana 2 → Mapa com Leaflet + pinos coloridos + Geolocalização
Semana 3 → Lógica dos 7 dias + botão "Usar Magic Tool" + status dinâmico
Semana 4 → Tela de Lista + Busca por SLID/SSID + Upload de foto + Refinamentos
```

---

## Próximo Passo

Iniciar o desenvolvimento com o **Módulo 1 — Cadastro de HGU** e estrutura base do projeto React PWA.
