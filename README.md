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

**[▶ Watch the 4-minute demo](https://youtu.be/_iHMouFdNA4)** · **[Live desk](https://tirai.vercel.app)**

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

## How the cash leg uses cETH / CBTC (Canton Token Standard, CIP-0056)

The bond leg lives in the desk's own escrow; the **cash leg is a real registry
asset** — cETH (onRails), CBTC (BitSafe), Canton Coin, or USDCx — settled through
the token standard's `Allocation` flow. Tirai depends on the **frozen Splice v1
interface DARs** (`dars/`, never recompiled locally, so the package-ids match what
live registries implement against):

```
splice-api-token-metadata-v1     splice-api-token-allocation-v1
splice-api-token-holding-v1      splice-api-token-allocation-request-v1
```

Settlement is two-phase, exactly as the standard prescribes — the registry's
allocation needs the buyer's wallet plus the registry's off-ledger choice context:

1. **Award / accept** — `RFQ.AwardWithAllocation` (Vickrey, second price) or
   `Quote.ConvertToTokenTrade` (direct OTC, at the ask) consumes the winning
   sealed quote and creates a **`TokenTrade`**. It carries a `cashInstrument :
   InstrumentId` — *any* `{admin, id}`, so cETH and CBTC are the same code path
   (`test/daml/TokenSettlementTest.daml` exercises both).
2. **Allocate** — `TokenTrade` implements the standard **`AllocationRequest`**
   interface, so the buyer's wallet (Canton Loop, Console, …) renders it as
   *"allocate `clearingPrice` cETH to this settlement"* with no Tirai-specific
   integration. The registry locks the cash into an `Allocation` bound to this
   trade's settlement reference.
3. **Settle** — `TokenTrade_Settle` runs, in **one atomic transaction**:
   `Allocation_ExecuteTransfer` (registry moves cETH to the dealer) +
   `EscrowedHolding.DeliverTo` (bond to the buyer) + `TradeReport` (the
   regulator's post-trade view). DvP, or nothing. `TokenTrade_Cancel` /
   `_Expire` / `AllocationRequest_Reject` always return the dealer's collateral.

cETH **drives the state change**: the `Allocation` is what actually moves value to
the dealer, and the trade cannot complete without it. The desk's `Holding` and
`EscrowedHolding` also implement the real **`HoldingV1`** interface, so an
escrowed bond shows up as a *locked* position in any standard wallet. Instrument
identity is bound end-to-end — a quote priced in cETH cannot settle in CBTC, nor
against an impostor registry (`testWrongInstrumentRejected`).

To reproduce the frozen DARs: download `dars/` from the Splice release bundle
(`0.6.13_splice-node.tar.gz` → `splice-node/dars/`) at
[digital-asset/decentralized-canton-sync releases](https://github.com/digital-asset/decentralized-canton-sync/releases).

## Status

- [x] Ledger model + **36 Daml test scripts green** (`test/`)
- [x] **CIP-0056 cETH / CBTC settlement leg** (Splice v1 interfaces, DvP tested)
- [x] **Deployed on two Canton Devnet participants** (privacy verified on both)
- [x] Three-party web desk (buyer / dealers / regulator) over the JSON Ledger API
- [x] MCP server + agent scripts
- [x] **Hosted read-only desk — https://tirai.vercel.app** (live Devnet state)
- [x] **Demo video — https://youtu.be/_iHMouFdNA4** (4:27, the desk driven for real)
- [ ] Live cETH transactions on Devnet — pending the onRails test-token grant

### Live on Devnet

Same package id on both participants: `tirai-desk`
`4b1e408f6eda27364a55da076d9251ee117f0641f03aaf20883995f1e507a7e3`, parties
`tirai-v1-*` (Canton 3.5.x).

| Participant | Namespace | Live state |
|---|---|---|
| **`hackcanton-01`** (HackCanton's own node) | `122003aa7c49…` | 20 settled trades + 1 atomic basket, 16 best-execution attestations, 32 quote disclosures, 3 open RFQs |
| **Shared 5N validator** | `1220a14ca128…` | 41 settled trades + 5 atomic baskets, 16 attestations — this is what the hosted desk reads |

`node scripts/devnet.mjs verify` (add `ENV_FILE=.env.hackcanton` for the
HackCanton node) asserts **on the real network** that each dealer sees only its
own quotes and the regulator sees zero pre-trade contracts — and exits non-zero
if a single quote ever leaks.

The hosted desk reads the 5N deployment because its proxy can hold a machine
credential; `hackcanton-01` issues only 3-hour user tokens. On that node the DAR
upload and party allocation are participant-admin only and were done by the node
operators on request — the deployer treats the resulting `403` as "already done"
and addresses the operator-allocated parties directly.

### Test suites

| Suite | Command | Result |
|---|---|---|
| Daml model | `cd test; daml test` | 36 / 36 |
| Hosted QA, 3 browsers | `node scripts/e2e-hosted.mjs` | 66 / 66 |
| MCP against live Devnet | `node scripts/e2e-mcp.mjs` | 25 / 25 |
| Read-only proxy security | `node scripts/test-readonly-proxy.mjs` | 14 / 14 |
| Local write-path UI | `npm run e2e` · `e2e:bestexec` · `e2e:actions` | 22 / 22 · 8 / 8 · 16 / 16 |

The three local suites drive the real ledger, so **restart `npm run demo` before
each one**: a dealer can only quote while it still holds the exact RFQ quantity,
and a suite run against a used ledger dies waiting for the quote button.

## Run locally

```powershell
# prerequisites: Daml SDK 3.4.11, JDK 21, Node
daml build --all
npm run demo        # sandbox + seed + web desk on http://localhost:8080
cd test; daml test  # 36 scripts
```

## Layout

| Path | What |
|---|---|
| `daml/Tirai.daml` | ledger model — RFQ, sealed quotes, escrow, DvP rails, `TokenTrade` |
| `dars/` | frozen Splice CIP-0056 interface DARs (data-dependencies) |
| `test/` | 36 Daml test scripts (incl. `MockRegistry` implementing the real interfaces) |
| `web/` | three-column desk + Node proxy |
| `api/` | read-only serverless proxy (hosted deployment) |
| `scripts/` | Devnet deployer, local demo, e2e suites, recorder, PDF/logo generators |
| `mcp/` | MCP server — 6 tools: 5 read-only + `post_rfq`, which writes a real RFQ |
| `media/` | demo video + subtitles, logo variants, submission PDFs |
| [`SUBMISSION.md`](SUBMISSION.md) | tracks, business brief, pilot plan |
| [`JOURNAL.md`](JOURNAL.md) | daily build journal (what was built, what broke) |
| [`DEMO-VO.md`](DEMO-VO.md) | demo video script, for a human read of the same walkthrough |

Submission documents are generated, not hand-maintained binaries:
`npm run pdf` (or `node scripts/make-pdf.mjs value|icp|gtm|metrics|pitch` for
one) renders them to `media/`, and `npm run logo` renders the logo variants.
The raw silent screen capture is gitignored — the narrated `.mp4` is the
artefact that ships.

## License

MIT
