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

## 2026-08-04 — the cash leg settles in a currency I do not issue

Tirai reached the Grand Final. The judges' one technical ask was the honest gap
we had already written down ourselves: settlement against a **real external
Canton Token Standard issuer**, not our own `MockRegistry`.

That gap turned out to be one probe deep. The 5N validator Tirai is deployed on
exposes the Token Standard registry API through its scan proxy:

```
GET /api/validator/v0/scan-proxy/registry/metadata/v1/info
    → adminId "DSO::1220be58c29e…"
GET …/metadata/v1/instruments
    → Amulet · "Canton Coin" · supports splice-api-token-allocation-v1
```

`splice-api-token-allocation-v1` is exactly the interface `TokenTrade` was
written against. So the cash leg could settle in Canton Coin — issued and
administered by the DSO, an issuer this project does not control and cannot
mint into — with no model change, no redeploy, and no waiting for a token grant.

`node scripts/devnet.mjs seed-cc` now does it end to end:

1. **Fund the buyer** — the validator's own wallet party holds CC, so the desk's
   buyer is funded through the registry's `transfer-factory`, two-phase
   (`TransferFactory_Transfer` → parked instruction → `TransferInstruction_Accept`,
   because the receiver has no transfer pre-approval).
2. **Run the auction** — unchanged. Sealed quotes, escrowed bonds,
   `AwardWithAllocation` at the second price or `ConvertToTokenTrade` at the ask.
3. **Allocate** — ask `allocation-instruction/v1/allocation-factory` for a choice
   context, exercise `AllocationFactory_Allocate`, and the registry locks the cash.
4. **Settle** — `TokenTrade_Settle` executes `Allocation_ExecuteTransfer` plus the
   bond delivery plus the regulator's report, in one atomic transaction.

Live on the 5N validator: **six trades settled in real Canton Coin** — four
reverse-Vickrey, two direct OTC — moving **60,900 CC** to the winning dealers.
`verify` re-run afterwards is still green: each dealer sees only its own quotes,
the regulator still sees zero pre-trade contracts, now over 47 settlements.

Two findings worth passing on, both of which cost time:

- **Registry choice contexts are round-scoped.** The contracts they disclose are
  archived when the amulet round rolls. A retry must *refetch* the context; a
  replay fails as `UNKNOWN_CONTRACT_SYNCHRONIZERS … has been archived`, which
  reads like a bug in your own command rather than an expired context.
- **A wildcard `active-contracts` read is capped at 200 elements by the node**,
  and it is not a query parameter. The buyer had quietly passed that cap, so the
  hosted desk's buyer column was returning an error instead of contracts. Both
  the deployer and the desk now read per template and re-join. Ledger growth
  broke a read path that had worked for weeks — worth checking on any Canton app
  that queries an ACS with an empty filter.

cETH and CBTC remain the same code path with a different `InstrumentId` admin.
The blocker there was never the engineering.

## 5 August — the fee stops being a slide

The judges' feedback named the business model, and slide 08 claimed a fee the
contract could collect while the contract could not. Two honest options: soften
the slide, or build it. Building it was small, because settlement was already one
atomic transaction — the fee is one more leg of a transaction that existed.

`venue` and `feeBps` on the RFQ, both `Optional` and appended so the template stays
upgrade-compatible. The interesting part was not the arithmetic but the plumbing:
there were three cash payout sites (Vickrey, Vickrey partial, direct-OTC partial)
and the third had its own copy of the payment line, so a fee added to the first two
would have been silently skippable by hitting a quote directly. All three now go
through one `payDealer`. `TradeReport.feePaid` records the amount, so an auditor
reads the fee off the trade instead of inferring it from a stranger's wallet.

Shipped as an upgrade, not a redeploy. `daml.yaml` now names the deployed 0.1.0 DAR
as the upgrade base — rebuilt from `main` and byte-identical down to the package id
`4b1e408f…`, which is the only reason the check means anything. `damlc` then refuses
a change that would strand an existing contract. Before each upload I rehearsed the
whole thing against a sandbox that already held the old version and submitted the
*old* client's payload: 13 checks, twice, both green. The hosted desk was re-checked
after the upload, 87/87.

Two things this exposed that had nothing to do with fees. Writes were addressing a
frozen package id discovered from whatever contract happened to be read first, so
after any upgrade the desk would have quietly kept creating on the old template —
now they name the package and let the node pick the newest vetted version. And
`demo-local.mjs` booted the sandbox from a hard-coded `tirai-desk-0.1.0.dar`, which
the version bump deleted; `npm run demo` would have failed for the next person to
clone. Both were found by asking what breaks on merge rather than by anything
failing.

The limit worth stating: on the registry rail the fee is not taken. Canton Coin and
CBTC move through the issuer's allocation and never become a holding this desk can
split. That is in the deck now, not buried in a commit message.

## 27 August — the second price was optional, and nobody had to say so

A question about the auction turned into the worst bug in the model. `Award` takes an
explicit list of quote contract ids from the buyer, and nothing on the ledger says that
list is every quote received. That was known and documented as safe, on the reasoning
that dropping a quote raises the price the buyer pays. It does — while two or more
remain. Drop everything except the winner and there is no second entry to price against,
and the clearing expression fell back to the winner's own ask.

So the buyer could read every sealed number, then choose between paying the second price
and paying the first, and the choice left no trace. The shed quote is never revealed to
anyone, so the losing dealer cannot see that it was dropped rather than beaten, and the
winner cannot tell its own ask from a second price that happened to equal it. A dealer
that expects this stops quoting its true number, which is the whole mechanism.

The fix is an arity check, but the place to put it was the interesting part. All three
award paths — `Award`, `AwardPartial`, `AwardWithAllocation` — carried a byte-identical
copy of the validate-sort-clear block, the same shape as the three cash payout sites the
venue fee nearly slipped through in August. One guard in one of them would have left the
other two open. They now share `runAuction`, which is where the check lives: a quote list
of one is refused outright. A buyer that wants to lift an ask still can, through the
direct rail, which settles at the ask and records itself as a direct trade rather than
borrowing the auction's name.

Order of the assertions matters more than it looks. The RFQ-binding and one-quote-per-dealer
checks run before the arity check, so `testCrossRfqRejected` and `testDuplicateDealerRejected`
still fail for their own reasons rather than being swallowed by the new one. Three existing
tests were passing single-quote lists into paths that were really testing something else —
insufficient cash, counterfeit cash, no-fee settlement — and would have started failing for
the wrong reason while still reporting green. Those now use two dealers.

Shipped as 0.4.0 rather than a rebuild of 0.3.0: the behaviour changed and 0.3.0 is live
on the validator, so reusing the number would put two different packages behind one
version. Upgrade validation against the 0.1.0 base passes. `testCannotShedSecondPrice`
is the regression test, and the suite is 42 scripts — the desk refuses the award, then
takes the same trade down the direct rail and lands at the ask.

Two surfaces followed. The desk no longer offers Award on a one-quote RFQ and says why,
because a button that the ledger will refuse is worse than no button. And both Q&A packs
asserted the old, wrong claim in English and Indonesian, as a security argument to a
dealer — those now describe what is actually enforced, and B10 answers "worst bug you
know about" with this one instead of a hypothetical.

Closing the fallback then exposed what it had been hiding. Two suites went red —
`e2e:actions` and `e2e:paths` — and both for the same reason: each awarded with a
single sealed quote and had been passing on the first-price fallback without ever
saying so. `e2e:paths` simply never sealed a second dealer's ask. `e2e:actions` tried
to, and dealer B's quote was disappearing: click the button, no toast, no console
error, no command on the wire, no quote.

The assertion that should have caught it was too loose to. The partial award checked
`price < 2,000,000` for an expected 1,700,000, and a one-quote award clears at
4,210,000 × 400/1000 = 1,684,000, which also passes. Both numbers sit under the bound,
so the check could not tell a Vickrey clear from a first-price one. It asserts the
number exactly now.

The disappearing quote cost the most time and was the best find. I spent a while on the
wrong theory — that the 1.8-second poll rebuilds a column with `innerHTML` and a click
in flight lands on a detached button — and the evidence looked right, because inserting
a wait made it pass. It was not that. `guarded`, the double-click protection, held a
single app-wide `acting` flag and returned early when it was set. Not a queue, not an
error: a bare `return`. So any action begun while any other was still open was dropped
on the floor, and the desk had no way to tell you. Dealer A's submit was still in flight
when dealer B pressed its button four hundred milliseconds later, and on the
side-by-side desk those two dealers have nothing to do with each other.

The guard is per button now. Disabling the button that was pressed is what double-click
protection actually needs, and the shared flag is deleted. Two actions that genuinely
collide on the same contract are refused by the ledger, with a message, which beats
silence. What makes this worth writing down is that the failure had no symptom at all —
no error anywhere, on any surface — and it survived every suite because the one test
that walked into it was checking a number loose enough to accept the wrong answer.

The wrong theory left something worth keeping. Renders go through `setHTML`, which
skips the write when the markup is unchanged and yields a container back while a field
inside it has focus or a pointer just went down in it. The poll's steady state is a
no-op now, and an ask no longer gets wiped out from under someone typing it — which it
did, every 1.8 seconds, because the typed value lives in the DOM and not in the
template. `guarded` releases that hold when its action finishes, since the repaint
showing the result is the one the user is waiting for.

Counts: 42 Daml scripts, e2e 28/28, actions 18/18, best-exec 8/8, shell 23/23, paths
29/29, each on its own fresh sandbox. The seal step in `e2e:actions` gets one attempt
and no retry on purpose — a retry loop would hide this bug coming back. `e2e:mcp` needs
a Devnet token this machine cannot mint, so it stays unrun rather than claimed.

## 27 August, later — a mark, a page that asks for something, and a desk a stranger can follow

Three surfaces, one thread running through them: none of them was asking anyone for
anything.

**The logo did not exist.** There were four PNGs in `media/` and a script that drew
them, and not one was used anywhere — the landing rendered `tirai.` as CSS text and both
favicons were a monospace `t` on a dark square. The PNGs were also dark-only, in the
neon green that had already failed contrast when the product went light in August, so
adopting them was never an option. `web/logo-mark.svg` is a drawn curtain with a
scalloped hem and the one price that came out from behind it — a solid shape rather than
thin bars, because the first test any mark has to pass is 16 pixels. The file bakes its
own colours and switches on `prefers-color-scheme`, since a favicon inherits nothing;
the same path is inlined in both headers with `currentColor`, where it can follow the
ink around it. One geometry, two homes, and a comment in each pointing at the other.
`scripts/make-logo.mjs` and its four PNGs are now dead, and left in place until someone
says to remove them.

**The landing read like a submission.** It opened with a film, then four contracts, then
a table comparing chains — an argument aimed at a judge who has already decided to pay
attention. It now opens, proves, explains, shows what is running, and asks: one design
partner, on Devnet, for ninety days, with what it costs you, what you get and what I want
back stated in three cards, and the honest note that the trading history was seeded by me
and is not customer volume. The film and the chain-lineage table still exist, below the
ask, where evidence belongs. The numbers in the new "running now" band come from the
ledger, and the page says so rather than implying it.

**The desk assumed you had been introduced.** On 2 September it gets ten minutes of live
screen share in front of people who have never seen it, so the test stopped being "can I
drive this" and became "can someone watching follow it". The hint strip was already
there and already dismissible, so it became the tracker instead of growing a second one:
four steps, the current one lit, read from the ledger — a request open, two asks sealed,
a report filed. Empty states say what to do next instead of reporting that nothing has
happened. And a settlement stays on the glass as a line of large type, because the toast
that used to announce it was gone in three seconds, which is less time than an audience
needs to read a number.

The privacy claim is now a sentence with counts in it, and it lives in the footer of the
side-by-side view rather than inside a dealer's column. That placement is the whole
point: the side-by-side seat is declared omniscient, so it may say "two sealed asks on
the book, and every dealer column beside it holds none of its rivals'". A dealer's own
column may not, because that column is supposed to show what its node actually holds,
and a node that knew a rival had quoted would be the bug this product exists to avoid.

One bug worth the note: `.landed { display: flex }` outranks the browser's `[hidden]`
rule, so the settlement strip sat on the page as an empty green bar until a trade landed.

e2e 28/28 · actions 18/18 · shell 23/23 · best-exec 8/8 · paths 29/29, each on a fresh
sandbox. The share cards are not regenerated: `npm run social` shoots the hosted desk,
and the hosted desk is still the old build.
