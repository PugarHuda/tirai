# Build journal — Tirai (HackCanton Season #2)

Daily log of what was built, what broke, and what was decided. Commits are
linked so every entry is checkable against the repo history.

---

## 2026-07-22 — repo, rebrand, and the honest lineage

Started Tirai as its own public repo (`bde6014`, `5d72613`). The codebase
continues [Bisik](https://github.com/PugarHuda/bisik), my Encode "Build on
Canton" entry — that is stated in the README, in `SUBMISSION.md`, and here,
because a judge who recognises the model should hear it from me first.

Work done:

- Full rename `bisik` → `tirai`: Daml module `Tirai`, package `tirai-otc`,
  test package `tirai-test`, target parties `tirai-v1-*`.
- Deleted every Bisik-era submission artefact (deck, demo script, QA notes) —
  they described a different submission and would have been stale on day one.
- Stale hard-coded package id (`b0058535…`, the Bisik Devnet package) replaced
  with `SET_AFTER_DEPLOY` in `mcp/server.mjs` and `scripts/devnet.mjs`, so
  nothing silently points at the old ledger state.
- 27/27 existing Daml scripts green after the rename.

Decision: the HackCanton build is **not** "the same app with a new name". The
new work is the settlement leg — real CIP-0056 assets instead of desk-minted
mock cash.

## 2026-07-23 — the cash leg becomes real (CIP-0056)

The core build day (`81eba24`, `cdfba6c`, `d540bbb`, `6ba3719`).

Research first: the inherited `token-standard/` directory was a *native
re-implementation shaped like* CIP-0056 — useless for a real registry, because a
live cETH/CBTC registry implements against the **Splice** interface package-ids,
not mine. So:

- Pulled the frozen Splice v1 interface DARs from the release bundle
  (`0.6.13_splice-node.tar.gz`) into `dars/` and wired them as
  data-dependencies. They are never recompiled locally — recompiling would
  change the package-id and break the match with live registries.
- Added `TokenTrade` to `daml/Tirai.daml`, implementing the standard
  **`AllocationRequest`** interface, plus `RFQ.AwardWithAllocation` (Vickrey,
  second price) and `Quote.ConvertToTokenTrade` (direct OTC).
- `TokenTrade_Settle` performs, in **one atomic transaction**:
  `Allocation_ExecuteTransfer` (registry moves cash to the winning dealer) +
  `EscrowedHolding.DeliverTo` (bond to the buyer) + `TradeReport` (regulator's
  post-trade view). DvP or nothing.
- `cashInstrument : InstrumentId` is any `{admin, id}` — cETH, CBTC, Canton
  Coin and USDCx are one code path, not four.
- Dropped the old in-package `Token` interface; `Holding` / `EscrowedHolding`
  now implement the **real** `HoldingV1`, so escrowed collateral shows as a
  *locked* position in any standard wallet. That also removed the smart-contract
  upgrade wall, so the package could be renamed `tirai-otc` → `tirai-desk`.
- Deleted `token-standard/` entirely. Keeping a fake alongside the real thing
  is how a reviewer ends up reading the wrong one.

Tests: `test/daml/MockRegistry.daml` implements the real Holding + Allocation
interfaces so the DvP path is exercised without a live registry;
`TokenSettlementTest.daml` adds 9 scripts — Vickrey DvP, direct DvP, cancel,
expiry, **forged-allocation rejection**, instrument binding, the wallet-facing
`AllocationRequest_Reject`, and `testCbtcDvp` (a second, differently-administered
registry) to prove the path is asset-agnostic rather than cETH-shaped.

Deployed to Canton Devnet: package `tirai-desk`
`4b1e408f6eda27364a55da076d9251ee117f0641f03aaf20883995f1e507a7e3`, parties
`tirai-v1-*`. The network was mid-upgrade (`TOPOLOGY_LSU` freeze) so the upload
needed a retry loop. `seed` + `verify` then passed **on the live network**: each
dealer sees only its own quote, the regulator sees zero pre-trade contracts.

## 2026-07-24 — hosted desk live, and the hackcanton-01 node

`8bedf96`, `20b0da8`, `6bd733c`.

- Hosted read-only desk live at **https://tirai.vercel.app**, reading real
  Devnet state through a serverless proxy that holds the token server-side and
  **403s every write path** (`/v2/commands/*` verified rejected in production).
- Read the node materials properly and found the correction that mattered:
  HackCanton has **its own DevNet participant, `hackcanton-01`** (Noders NaaS).
  Tirai was deployed to the *5N* validator from the earlier hackathon, so the
  deployer needed to target a second, differently-authenticated node.
- `scripts/devnet.mjs` made node-agnostic: `ENV_FILE` selects the target, the
  ledger user id is env-driven, and `token()` branches to a Keycloak **password
  grant**. Backwards-compatibility with the 5N node re-verified.
- Then hit two blockers: the TLS certificate on `keycloak.naas.noders.services`
  was rejected as expired from this machine, and the password grant returns
  `invalid_grant` because the AppsFactory account is Google SSO (no local
  password to grant against). Worked around both by teaching `token()` to accept
  a **pre-issued bearer** from the wallet UI session (`DEVNET_TOKEN`), skipping
  Keycloak entirely — the ledger host's own certificate is valid.
  *(Corrected 26 Jul — see below: the certificate is fine now.)*

## 2026-07-26 — hackcanton-01: authenticated, but not authorised

Took the browser bearer from the wallet UI session and pointed the deployer at
`hackcanton-01`. The token is accepted by the ledger — but only as an end user:

| Call | Result |
|---|---|
| `GET /v2/state/ledger-end` | **200** (offset 433,669) |
| `GET /v2/version` | **200** — Canton 3.5.9 |
| `GET /v2/users/<sub>` | **200** — one right: `CanActAs` its own wallet party |
| `POST /v2/packages` (upload DAR) | **403** |
| `POST /v2/parties` (allocate) | **403** |
| `GET /v2/users`, `GET /v2/parties` | **403** |

So deploying to `hackcanton-01` is not blocked by a token or a certificate — it
needs **participant-admin rights**, which a wallet-UI user does not have. Either
a participant-admin / M2M credential from Noders, or Noders uploading the DAR
and allocating the six parties, unblocks it in minutes; the deployer command
chain (`upload → allocate → seed → verify`) is already written and tested
against the other node. Reported to the organisers.

**Correction, same day.** Another team checked the Keycloak certificate and
found it valid; re-verified from here: `keycloak.naas.noders.services` presents
a Let's Encrypt certificate issued **24 Jul, valid to 22 Oct**, and Node's
`fetch` now completes against it. The 24 Jul failure was real but is not a
standing outage — it was either the renewal window itself or a missing
intermediate locally, so the earlier "expired for everyone" claim is withdrawn.
The password grant still returns `invalid_grant` for this account, which is the
Google-SSO problem, not a TLS one — so the wallet bearer remains the right path.

**Deployed on `hackcanton-01` — same day.** The node operators (Noders) vetted
the DAR and allocated the six parties within hours of the request: package
`tirai-desk` `4b1e408f…` (identical package id to the 5N deployment), parties
`tirai-v1-*` under namespace `122003aa7c49…`, with `CanActAs` + `CanReadAs`
granted to this ledger user. Seeded and settled from here against a fresh
wallet-session bearer:

- first trade on the node: **GILT10 @ 195,000**, reverse-Vickrey, two sealed
  quotes → atomic DvP;
- then the wider set: **20 settled trades + 1 atomic basket, 16 best-execution
  attestations, 32 quote disclosures**, 3 open RFQs, across all three rails;
- `verify` on `hackcanton-01`: **green** — each dealer sees only its own quotes,
  the regulator sees zero pre-trade contracts.

One rejection worth writing down: the richer `seed-cases` set includes 3-dealer
auctions, and those failed with `UNKNOWN_INFORMEES` ("the participant is not
connected to any synchronizer where the given informees are known") because the
request had only asked for six parties — `tirai-v1-dealerC` was never allocated.
The error names a synchronizer problem but the cause is an unallocated party.

The hosted desk still reads the 5N deployment, and deliberately so: the proxy
needs a credential it can hold, and `hackcanton-01` issues only 3-hour user
tokens because the account is Google SSO. Two deployments, one package id.

**Demo video published:** https://youtu.be/_iHMouFdNA4 — 4:27, the desk driven
end to end against a Canton participant (RFQ → sealed quotes with the rival
column visibly empty → selective disclosure → Vickrey award → atomic
settlement), then the privacy verification, best execution, and a closing
chapter on the public Devnet deployment. Recorded with `npm run record:demo`,
which drives the real ledger rather than a scripted mock-up, and narrated over
the measured timeline.

Two things learned from that same exchange, both recorded here because they will
save the next person hours: DAR upload and party allocation on `hackcanton-01`
are done on request by the node operators, and **a DAR whose package name
collides with one already on the node uploads successfully and then sits
permanently unvetted** — Daml upgrade validation runs at vetting, not at upload,
so it surfaces later as `NO_SYNCHRONIZER_FOR_SUBMISSION … has not vetted`, which
reads like a queue rather than the rejection it actually is. Tirai's package
name (`tirai-desk`) is distinct, but the deploy request now says so explicitly.

Meanwhile the deployed-and-verified state on the 5N Devnet validator stands:
package `4b1e408f…`, parties `tirai-v1-*`, hosted desk live.

Test status this day: **`daml test` 36/36 ok**, read-only proxy self-test 14/14,
MCP suite **25/25** against live Devnet.

Then filled the ledger with real trading activity rather than a single demo
trade — `seed-cases` and `seed-bestexec` on the 5N validator. Live state now:

- **41 `TradeReport` + 5 `BasketTradeReport`** settled on-ledger, across
  reverse-Vickrey (incl. 3-dealer auctions), direct OTC and partial fills, over
  sovereigns (US, UK, Germany, Japan, France, Australia, Netherlands,
  Switzerland, Korea, Singapore, India, Indonesia), supranationals (IBRD, EIB,
  KfW) and corporates (Amazon, Nvidia, Goldman, JPM).
- **16 best-execution attestations** — for each, both dealers' asks were
  disclosed to the regulator *before* settlement, so the clearing price is
  provably ≤ every competing ask, across all three rails.
- **32 `QuoteDisclosure`** contracts, 5 open RFQs each carrying two sealed
  quotes, orphan RFQs tidied.
- `verify` re-run afterwards: still green — each dealer sees only its own
  quotes, the regulator still sees **zero** pre-trade contracts, with 46
  settlements in its audit view.

Also removed the `/deck` route: no slide deck ships (the pitch is the video), so
the rewrite only ever produced 404s in the hosted QA run.
