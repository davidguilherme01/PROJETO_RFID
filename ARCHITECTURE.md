# Arquitetura do RaceTrack RFID

Documento de referência das camadas, fluxo de dados e protocolos do sistema. O front-end neste repositório implementa todas as telas; este arquivo descreve **o que ele representa** (a infra real planejada no briefing).

---

## Visão geral em 3 camadas

```
┌────────────────────────────────────────────────────────────────┐
│  CAMADA 1 · HARDWARE FÍSICO                                     │
│  • Tags UHF passivas (200) costuradas na camisa do atleta       │
│  • Cinta cardíaca Polar/XOSS H10 (200)                          │
│  • Celular do atleta (uplink BLE → HTTP)                        │
│  • Antenas RFID Intelbras (10) · 1 por checkpoint × 2 redund.   │
│  • Leitor RFID YANZEO SR681 (1, 4 portas de antena)             │
│  • Monitores Acer (2) na sala de comando                        │
├────────────────────────────────────────────────────────────────┤
│  CAMADA 2 · REDE                                                │
│  • Switch TP-Link 48p (gerenciável)                             │
│  • Roteador enterprise (gateway + firewall)                     │
│  • Access Point Ubiquiti WiFi 6                                 │
│  • Rack 19" 24U (sala técnica)                                  │
├────────────────────────────────────────────────────────────────┤
│  CAMADA 3 · SOFTWARE                                            │
│  • Servidor 1: Banco de dados                                   │
│  • Servidor 2: Aplicação (API + WebSocket + front estático)     │
│  • Replicação ativa entre os 2 (redundância)                    │
│  • Front-end React (este repositório)                           │
└────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de dados — passagem de checkpoint

```
1. Atleta cruza um checkpoint.
2. Antena UHF energiza a tag passiva (alcance ~5m, 860-960 MHz).
3. Tag responde com seu EPC de 96 bits.
4. Leitor YANZEO recebe via cabo coaxial, anota RSSI e timestamp local.
5. Leitor envia evento via TCP/IP (Ethernet) ao Switch.
6. Switch roteia ao Servidor 2 (Aplicação).
7. Servidor 2:
   ├─ Persiste em Servidor 1 (Banco).
   ├─ Calcula tempo parcial, ritmo, posição.
   ├─ Atualiza ranking ao vivo.
   └─ Publica em WebSocket → todos os clientes conectados.
8. Clients (Dashboard admin, app do espectador, etc) atualizam UI.
```

## Fluxo de dados — frequência cardíaca

```
1. Cinta Polar H10 mede ECG no peito, infere BPM.
2. Transmite via Bluetooth 5.0 (BLE) ao celular pareado.
3. App do atleta (PWA, planejado) faz POST HTTP ao Servidor 2 a cada N segundos.
4. Servidor 2 persiste em Banco + publica via WebSocket aos interessados:
   ├─ Tela "Minha frequência" do próprio corredor.
   ├─ Cards do espectador que está acompanhando.
   └─ Painel de alertas do administrador.
5. Se BPM cai fora da faixa segura (100-180 bpm), Servidor 2 emite alerta
   crítico → notificação persistente no painel do admin + push pro
   contato de emergência (planejado).
```

---

## Protocolos por camada

| Camada | Origem → Destino | Protocolo | Frequência / banda |
|---|---|---|---|
| Hardware | Tag → Antena | RFID UHF passivo | **860-960 MHz** (banda livre BR) |
| Hardware | Antena → Leitor | Sinal coaxial | analógico |
| Hardware | Cinta → Celular | **Bluetooth 5.0 LE** | 2.4 GHz |
| Rede | Leitor → Switch | **Ethernet** (TCP/IP) | 1 Gbps |
| Rede | Roteador ↔ Switch ↔ Servidores | **Ethernet** | 1 Gbps |
| Rede | AP ↔ devices | **WiFi 6** (802.11ax) | 5 GHz + 2.4 GHz |
| Aplicação | Celular → Servidor 2 | **HTTPS** REST | a cada 3-5s |
| Aplicação | Servidor 2 → clients | **WebSocket** (wss) | tempo real |
| Aplicação | Servidor 1 ↔ Servidor 2 | Replicação SGBD | contínua |
| Aplicação | Front ↔ API | **HTTPS** REST + WebSocket | sob demanda + push |

---

## Função detalhada de cada equipamento

### Captura
| Equipamento | Quant. | Função |
|---|---:|---|
| **Tag RFID UHF EPC Gen2** | 200 | Identificador único por atleta. Passiva, sem bateria, vida útil ~10 anos. |
| **Camisa personalizada** | 200 | Bolso interno costurado pra abrigar a tag. Dry-fit. |
| **Antena RFID Intelbras** | 10 | Polarização circular, ganho 8 dBi, IP67. 2 antenas por checkpoint pra redundância de leitura. |
| **Leitor YANZEO SR681** | 1 | 4 portas de antena → multiplexa as 8 antenas ativas. Interface Ethernet + RS232. |
| **Cinta XOSS H10** | 200 | Cinta peitoral BLE compatível com Polar H10. Transmite BPM a cada segundo. |

### Rede
| Equipamento | Quant. | Função |
|---|---:|---|
| **Switch TP-Link 48 portas** | 1 | L2 gerenciável, conecta leitor + servidores + AP + roteador. |
| **Roteador enterprise** | 1 | Gateway de borda. NAT, firewall, VPN opcional, QoS para priorizar tráfego do leitor. |
| **Access Point Ubiquiti WiFi 6** | 1 | Cobertura wireless da sala técnica + arquibancada. Suporta 250+ devices simultâneos. |
| **Rack 19" 24U** | 1 | Aloja switch, roteador, 2 servidores e leitor. Fechadura física. |

### Servidores e clientes
| Equipamento | Quant. | Função |
|---|---:|---|
| **Servidor Dell PowerEdge** | 2 | (1) Banco de dados — PostgreSQL ou MySQL. (2) Aplicação — API REST + WebSocket + serve build estático do front. Replicação ativa-ativa. |
| **Monitor Acer 23.8" FHD** | 2 | Painel de comando na sala técnica — exibe Dashboard admin em fullscreen. |

---

## Camadas do código (front-end)

```
┌─ Apresentação ──────────── pages/ + components/
│  ├─ Layout shell           components/layout/
│  ├─ Páginas por perfil     pages/admin · pages/corredor · pages/espectador
│  └─ Componentes de domínio components/dashboard · components/corredores · etc
│
├─ Estado ────────────────── store/ (Zustand)
│  ├─ authStore              sessão do usuário (persisted)
│  ├─ themeStore             dark/light (persisted)
│  ├─ corredoresStore        CRUD + filtros + seleção
│  └─ dispositivosStore      seleção do painel hardware
│
├─ Dados (mock) ──────────── data/
│  └─ Lê tudo de mocks estáticos. Substituir por fetch ao backend
│     real ataca apenas os hooks (hooks/use*Live), não as telas.
│
├─ Lógica viva ───────────── hooks/
│  ├─ useRealTimeMetrics     random walk pra simular WebSocket
│  ├─ useRankingLive         atualiza a cada 5s
│  ├─ useLeiturasRecentes    adiciona nova a cada 3-7s
│  ├─ useAlertasCardiacos    novo alerta cada 30-60s
│  ├─ useKonamiCode          easter egg
│  └─ useDebounce            inputs com busca
│
└─ Infra de UI ───────────── lib/
   ├─ constants.ts           rotas, perfis, storage keys
   ├─ menuConfig.ts          menu dinâmico por perfil
   ├─ notifications.ts       wrapper sonner
   └─ utils.ts               cn()
```

A separação garante que, ao trocar mocks por fetch real:
- **Telas (`pages/`) não precisam mudar.** Recebem dados via hooks.
- **Hooks (`hooks/use*Live`) ganham `fetch` / WebSocket** e mantêm a mesma interface de retorno.
- **Stores não mudam** — continuam guardando UI state.

---

## Decisões de design relevantes

- **Mobile-first nas áreas públicas** (`/corredor/*` e `/espectador/*`) porque o acesso esperado é por QR Code via celular. Sidebar vira `BottomNav` abaixo de `lg`.
- **Sidebar colapsável** (264 ↔ 72 px) na área admin pra liberar espaço pro Dashboard rico.
- **Tema dark por padrão** — paleta com `--primary` verde neon (#22c55e). Light theme implementado mas não é o default.
- **Lazy loading** de todas as páginas pesadas (gráficos + tabelas grandes + forms). Login/Home/SemAcesso/NotFound/Erro ficam eager.
- **`errorElement` em vez de ErrorBoundary classe** — react-router 7 já oferece isso nativamente, evita boilerplate.
- **Persistência de UI state** (auth, theme, favoritos) só via Zustand `persist`. Sem libs externas.
