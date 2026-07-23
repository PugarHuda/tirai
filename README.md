# Tirai

[![CI](https://github.com/PugarHuda/tirai/actions/workflows/ci.yml/badge.svg)](https://github.com/PugarHuda/tirai/actions/workflows/ci.yml)

> *tirai* — Indonesian for "curtain". Price discovery happens behind it.

**Tirai is a confidential multi-dealer RFQ / OTC desk built native on the Canton
Network.** A buyer requests quotes from a chosen dealer panel; each dealer's quote
is sealed — competing dealers never receive it, the market never sees the RFQ, and
losing quotes are archived without ever being revealed. Settlement is atomic
delivery-versus-payment. A regulator observes executed trades — and only executed
trades.

Built for **HackCanton Season #2** (Noders / AppsFactory, Jul 2026).

> **Lineage, disclosed up front:** Tirai continues the codebase of
> [Bisik](https://github.com/PugarHuda/bisik), our entry to Encode's Build on
> Canton hackathon (deployed and verified live on Canton Devnet). Tirai is the
> productionisation pass: rebrand, and — the core of this build — settlement in
> **real Canton Token Standard (CIP-56) assets, targeting cETH and CBTC**,
> instead of desk-minted mock cash.

## The fifth implementation — and the first native one

We have built this exact product thesis four times, on four chains, each time
fighting the chain's transparency with heavy machinery:

| Project | Chain | Privacy machinery we had to build |
|---|---|---|
| [Diam](https://github.com/PugarHuda/diam) | Arbitrum (iExec Nox) | TEE-based confidential compute, encrypted handles |
| [Segel](https://github.com/PugarHuda/segel) | Stellar (Soroban) | Two Circom/Groth16 ZK circuits, hand-rolled Poseidon |
| [Sealed Pair](https://github.com/PugarHuda/sealed-pair) | Sui | Walrus blob commitments + Seal threshold encryption |
| [Samar](https://github.com/PugarHuda/samar-confidential-otc) | Ethereum (Zama fhEVM) | FHE, branchless `FHE.select` settlement |
| **Tirai** | **Canton** | **None. Sub-transaction privacy is the ledger model.** |

On Canton, "dealer B cannot see dealer A's quote" is not a cryptographic
achievement — it is a `signatory`/`observer` declaration.

## What it does

- **RFQ** — a buyer opens a request; only invited dealers see it (observers).
- **Sealed quotes** — each quote is signed dealer+buyer with no other observers.
  Dealer A cannot see dealer B's price, on-ledger.
- **Escrow** — quoting locks the dealer's asset into an `EscrowedHolding`.
- **Three settlement rails** — reverse-Vickrey award (2nd-price), direct bilateral
  OTC accept, and partial fills on both rails. All settle as **atomic DvP**.
- **Post-trade transparency** — the regulator observes `TradeReport` only:
  zero pre-trade visibility, full post-trade audit.
- **Selective disclosure** — buyer or dealer can open a single sealed quote to the
  regulator on demand (best-execution audit / fair-pricing defence).
- **Provable best execution** — from disclosed quotes + trade reports, the desk
  proves clearing ≤ every disclosed rival ask. No public order book required.
- **Basket RFQs** — multi-instrument baskets quoted at one sealed price, settled
  as atomic multi-leg DvP.

## Status

- [x] Ledger model + **27 Daml test scripts green** (`test/`)
- [x] Three-party web desk (buyer / dealers / regulator) over the JSON Ledger API
- [x] Read-only MCP server + agent scripts
- [ ] **CIP-56 settlement leg (cETH / CBTC)** — in progress, this hackathon's build
- [ ] Deploy to Canton Devnet as `tirai-desk`
- [ ] Hosted read-only desk

## Run locally

```powershell
# prerequisites: Daml SDK 3.4.11, JDK 21, Node
daml build --all
npm run demo        # sandbox + seed + web desk on http://localhost:8080
cd test; daml test  # 27 scripts
```

## Layout

| Path | What |
|---|---|
| `daml/` | ledger model (`Tirai.daml`) |
| `test/` | 27 Daml test scripts |
| `token-standard/` | separate stable token package (SCU-safe interface home) |
| `web/` | three-column desk + Node proxy |
| `api/` | read-only serverless proxy (hosted deployment) |
| `scripts/` | Devnet deployer, local demo, e2e suites |
| `mcp/` | read-only MCP server (5 tools) |

## License

MIT
