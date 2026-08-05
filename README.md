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
> **real Canton Token Standard (CIP-56) assets** instead of desk-minted mock cash.
> CBTC settles today; cETH is the same code path and waits only on its token grant.

## Why Canton, and not the chain you already use

The same sealed-bid OTC thesis costs a different amount of cryptography depending on
where it is built. This is what a confidential RFQ desk has to bolt on and then keep
proving correct, chain by chain:

| Chain | What it broadcasts | Privacy machinery required |
|---|---|---|
| Ethereum | every quote, in the public mempool | FHE, or a ZK circuit per rule you want kept private |
| Sui, Stellar, Arbitrum | every quote, on a public ledger | ZK circuits, threshold encryption, or a trusted enclave |
| **Canton** | **nothing off the parties** | **None. Sub-transaction privacy is the ledger model.** |

On Canton, "dealer B cannot see dealer A's quote" is not a cryptographic
achievement — it is a `signatory`/`observer` declaration. There is no proving
system to audit, benchmark, or keep up to date, and the quote is not hidden from
a screen: the rival's participant node never received the contract.

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

### This is not a mock — it runs against a registry I do not control

`node scripts/devnet.mjs seed-cc` settles the desk's auctions in **Canton Coin
issued and administered by the DSO** on the 5N Devnet validator.
(`node scripts/devnet.mjs seed-fee 25` is the venue-fee counterpart: it runs one
auction that charges, then reconciles what the venue holds against what the trade
report says and fails if they disagree.) Nothing about the
cash leg is mine: the desk reads the registry's instrument list, asks its factories for
choice contexts, and hand the contracts it discloses to the ledger.

| Step | Registry endpoint (via the validator's scan proxy) | Ledger |
|---|---|---|
| Fund the buyer | `POST /registry/transfer-instruction/v1/transfer-factory`, then `…/{cid}/choice-contexts/accept` | `TransferFactory_Transfer` → `TransferInstruction_Accept` |
| Allocate the cash | `POST /registry/allocation-instruction/v1/allocation-factory` | `AllocationFactory_Allocate` |
| Settle | `POST /registry/allocations/v1/{cid}/choice-contexts/execute-transfer` | `TokenTrade_Settle` |

Six trades are live on that validator this way — four reverse-Vickrey, two direct
OTC, 60,900 CC moved to the winning dealers, each one bond-against-cash in a single
transaction. The registry reports `splice-api-token-allocation-v1` support, which
is the interface `TokenTrade` was written against.

**And it is not one registry.** `node scripts/devnet.mjs seed-foreign CBTC` settles the
same auctions in **CBTC**, issued by BitSafe through the DA Utility Registry
(`cbtc-network::12202a83…`): 0.34 CBTC cleared at the Vickrey second price, 0.22 CBTC
hit directly at the ask. The faucet grant arrives as a `TransferOffer` that only the
receiver can complete — `accept-incoming` does that — and from there nothing in the model
knows the difference. Each registry keeps its off-ledger choice contexts somewhere
different: Canton Coin behind this validator's scan proxy, the DA Utility Registry at
`{base}/api/token-standard/v0/registrars/{admin}/registry`. That, and only that, is what
the deployer had to learn.

Two things worth knowing before you run it: the registry's choice contexts are
**round-scoped**, so a retry must refetch the context rather than replay it (a
replay surfaces as "contract has been archived" and reads like your bug); and the
seeder is idempotent against on-ledger state, because DevNet drops responses for
commands that did in fact commit.

**cETH and CBTC change one field** — the `InstrumentId` admin. The code path,
the tests and the atomicity are identical; only the test-token grants are missing.

To reproduce the frozen DARs: download `dars/` from the Splice release bundle
(`0.6.13_splice-node.tar.gz` → `splice-node/dars/`) at
[digital-asset/decentralized-canton-sync releases](https://github.com/digital-asset/decentralized-canton-sync/releases).

## Status

- [x] Ledger model + **41 Daml test scripts green** (`test/`)
- [x] **CIP-0056 cETH / CBTC settlement leg** (Splice v1 interfaces, DvP tested)
- [x] **Deployed on two Canton Devnet participants** (privacy verified on both)
- [x] **Venue fee collected inside the settlement** — an RFQ can name a venue and a rate in
      basis points; the cut leaves the same atomic transaction as the trade, the dealer is
      paid its proceeds less the fee, and the buyer pays exactly what it cleared at. The
      trade report records the amount, so the audit trail states the fee rather than the
      venue having to claim it. Live: 4,250,000 cleared at 25 bps → 10,625 to the venue,
      4,239,375 to the winning dealer. **Not** on the registry rail — Canton Coin and CBTC
      move through the issuer's allocation, which is not a holding this desk can split.
- [x] Web desk over the JSON Ledger API — one signed-in identity per session
      (buyer / either dealer / regulator)
- [x] MCP server + agent scripts
- [x] **Hosted read-only desk — https://tirai.vercel.app** (live Devnet state) — you are
      **signed in as one identity** (buyer, either dealer, or the regulator) and the whole
      desk shows only what that party's participant node holds; switching identity is not a
      filter, it changes whose node is read. Home is **Active RFQs**, the book: every request
      that identity can see — instrument, quantity, mode, maker, cash leg, cleared price,
      sealed-quote count, status — with All / Mine / For me filters and one action per row.
      Sealing a quote, cancelling a request and reading a settlement receipt open as dialogs;
      **Create RFQ** is its own page with two execution modes (RFQ auction, direct OTC) and
      a choice of settlement rail. Alongside: **My activity**, **Portfolio** (holdings,
      including balances issued by an external registry), **Settlement rails** (every cash
      leg the desk can clear on, and who issues each one),
      **Verify privacy**, **Audit trail**, **Best execution**, and
      **Side-by-side proof** — every party's own view at once, which no deployed venue would
      show you
- [x] **Demo video — https://youtu.be/_iHMouFdNA4** (4:27, the desk driven for real)
- [x] **Live settlement against external Token Standard registries** — six trades in
      real **Canton Coin** through the DSO-run registry (`seed-cc`), and two in real
      **CBTC** through the DA Utility Registry that BitSafe issues on
      (`seed-foreign CBTC`), both on the 5N Devnet validator
- [ ] The same in **cETH** — identical code path, waiting only on the onRails token grant

### Live on Devnet

One package, `tirai-desk`, on both participants, parties `tirai-v1-*` (Canton 3.5.x).
`hackcanton-01` runs 0.1.0
(`4b1e408f6eda27364a55da076d9251ee117f0641f03aaf20883995f1e507a7e3`); the shared
validator has been upgraded through 0.2.0 to 0.3.0 for the venue fee, with all three
vetted side by side — see [Upgrades](#upgrades) for why contracts written under the
first still read under the last.

| Participant | Namespace | Live state |
|---|---|---|
| **`hackcanton-01`** (HackCanton's own node) | `122003aa7c49…` | 20 settled trades + 1 atomic basket, 16 best-execution attestations, 32 quote disclosures, 3 open RFQs |
| **Shared 5N validator** | `1220a14ca128…` | 50 settled trades (6 in real Canton Coin, 2 in real CBTC) + 5 atomic baskets, 16 attestations — this is what the hosted desk reads |

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
| Daml model | `cd test; daml test` | 41 / 41 |
| Hosted QA, 3 browsers | `node scripts/e2e-hosted.mjs` | 87 / 87 |
| MCP against live Devnet | `node scripts/e2e-mcp.mjs` | 25 / 25 — leaves one real RFQ on the ledger (it exercises the write tool); `devnet.mjs tidy` clears it |
| Read-only proxy security | `node scripts/test-readonly-proxy.mjs` | 14 / 14 |
| Deployer decision logic | `node scripts/test-devnet-logic.mjs` | 6 / 6 |
| Product path, one identity | `npm run e2e:shell` | 23 / 23 (incl. the front-end audit's regression checks) |
| Happy path and wrong path | `npm run e2e:paths` | 27 / 27 — bad input, actions an identity is not entitled to, a second quote from the same dealer, filters that hide everything. Every refusal is checked to have submitted **nothing**, not merely to have looked refused. Also awards a real `TokenTrade` and checks the awaiting-allocation state renders |
| Local write-path UI | `npm run e2e` · `e2e:bestexec` · `e2e:actions` | 28 / 28 · 8 / 8 · 16 / 16 |
| Venue fee, through the UI | `npm run e2e:fee` | 12 / 12 — the audit trail's fee column and revenue line against live Devnet numbers, a dash on trades that predate the fee, and a rate above the ceiling refused without submitting. Needs a desk pointed at Devnet: `cd web && LEDGER_ENV_FILE=../scripts/.env.devnet PORT=8091 node server.mjs` |
| Upgrade safety | rehearsed per upload, see `daml.yaml` | 13 / 13, twice — an old-version client still creates, package-name queries still answer, existing contracts stay visible |

The local suites drive the real ledger, so **restart `npm run demo` before
each one** (and `PORT=8090 npm run demo` with `TIRAI_URL=http://localhost:8090/app`
if something else on the machine already owns 8080): a dealer can only quote while it still holds the exact RFQ quantity,
and a suite run against a used ledger dies waiting for the quote button.

## Run locally

```powershell
# prerequisites: Daml SDK 3.4.11, JDK 21, Node
daml build --all
npm run demo        # sandbox + seed + web desk on http://localhost:8080
cd test; daml test  # 41 scripts
```

### Upgrades
<a id="upgrades"></a>

`daml.yaml` names the DAR this package upgrades (`dars/tirai-desk-0.1.0.dar`, a rebuild of
what is live, byte-identical down to the package id). `damlc` then checks every change
against the ledger's own contracts instead of against nothing: new template fields must be
`Optional` and appended, and a change that would strand an existing contract fails the build.
The validator runs 0.1.0, 0.2.0 and 0.3.0 side by side; contracts written under the first
still read under the last, and a trade report from before the fee existed shows a dash rather
than a zero.

Writes address the package by **name** (`#tirai-desk:Tirai:RFQ`), so the node picks the newest
vetted version. Pin one with `TIRAI_PKG` if you need the old template.

## Layout

| Path | What |
|---|---|
| `daml/Tirai.daml` | ledger model — RFQ, sealed quotes, escrow, DvP rails, `TokenTrade` |
| `dars/` | frozen Splice CIP-0056 interface DARs (data-dependencies) + `tirai-desk-0.1.0.dar`, the upgrade base `daml.yaml` checks against |
| `test/` | 41 Daml test scripts (incl. `MockRegistry` implementing the real interfaces) |
| `web/` | the desk — one signed-in identity, plus the side-by-side proof view — + Node proxy |
| `api/` | read-only serverless proxy (hosted deployment) |
| `scripts/` | Devnet deployer, local demo, e2e suites, recorder, PDF/logo generators |
| `mcp/` | MCP server — 6 tools: 5 read-only + `post_rfq`, which writes a real RFQ |
| `deck/` | the pitch deck — 15 slides, keyboard/click/swipe, full screen, and the film on slide 14. Served at [`/deck`](https://tirai.vercel.app/deck); `deck/NOTES.md` is the per-slide speaker guide |
| `video/` | Remotion source for the film, and `video/vo/` — the narration script and the mixer that places each line inside the shot it belongs to |
| `media/` | the film (narrated `tirai-demo.mp4` + its silent master), deck screenshots, logo variants, submission PDFs |
| [`SUBMISSION.md`](SUBMISSION.md) | tracks, business brief, pilot plan |
| [`JOURNAL.md`](JOURNAL.md) | daily build journal (what was built, what broke) |
| [`DECK-SCRIPT.md`](DECK-SCRIPT.md) | what to say over each slide, timed to the four-minute slot |
| [`PITCH-QA.md`](PITCH-QA.md) · [`PITCH-QA-DECK.md`](PITCH-QA-DECK.md) | 20 long-form answers, and 44 short ones keyed to the slide they point at |
| [`DEMO-VO.md`](DEMO-VO.md) | demo video script, for a human read of the same walkthrough |

Submission documents are generated, not hand-maintained binaries:
`npm run pdf` (or `node scripts/make-pdf.mjs value|icp|gtm|metrics|pitch` for
one) renders them to `media/`, and `npm run logo` renders the logo variants.
The film ships narrated. `media/tirai-demo-silent.mp4` is the Remotion render and
`media/tirai-demo.mp4` is the same picture with the voice track mixed onto it, so the
narration can be redone (`video/vo/say.mjs` then `mix.mjs`) without re-rendering. Only
the raw browser capture, `media/*.webm`, is gitignored.

## License

MIT
