# Tirai, honest status

An inventory of what this repository actually contains, written from the code
rather than from the documents. Every row names a file and a symbol so it can be
checked in about a minute.

**What I ran:** nothing. No ledger, no network, no `daml test`, no Playwright.
Everything below is read out of the source tree at the current commit
(`ae7fbf6`, 66 commits). Figures that can be counted from source (assertion
counts, tool counts, template and choice inventories) are stated as fact.
Figures that require a live run or a live network are marked `[unverified]`
with the command that would settle them.

---

> **Updated after this inventory was written.** Four of the gaps below have been closed,
> and the entries that describe them are kept so the history is legible:
>
> - **The fee claim (3.1) is closed in the model, not just in the documents.** `RFQ` and
>   `Quote` carry `venue` and `feeBps`; the cut is split off inside `SettleQuote`,
>   `SettleQuotePartial` and `AcceptPartial`, all three through one `payDealer`; and
>   `TradeReport.feePaid` records the amount so the audit trail states it. Shipped as an
>   upgrade rather than a redeploy: `daml.yaml` declares the deployed 0.1.0 DAR as the
>   upgrade base, and 0.1.0/0.2.0/0.3.0 are vetted side by side on the validator. One real
>   settlement — 4,250,000 at 25 bps, 10,625 to the venue. Three things are still true and
>   are said out loud in the deck: the rate is unset by default, the registry rail takes no
>   fee (that cash moves through the issuer's allocation), and revenue is zero.
> - **cETH and USDCx (3.2) are corrected.** The submission no longer claims settlement in
>   either. CBTC does settle: two trades through the DA Utility Registry.
> - **The counts (3.3) agree.** Everything says 50 settled trades, which is what the
>   ledger says.
> - **The token rail is no longer invisible in the desk.** An awarded trade waiting on its
>   allocation renders as "Awaiting allocation", and a rail-bound request offers "Settle ·
>   token rail" with an explanation instead of an action that silently does nothing.
>   Settling it from the browser is still not possible and is still the top item in §4.
>
> A `npm run e2e:paths` suite (29 checks) now covers the wrong paths: bad input, actions an
> identity is not entitled to, a second quote from one dealer, filters that hide everything,
> and the awaiting-allocation state. Every refusal asserts that no command was submitted.

## 1. Built and verified

### 1.1 Ledger model (`daml/Tirai.daml`, 687 lines, package `tirai-desk` 0.1.0)

| Capability | Where | How it is proven |
|---|---|---|
| Sealed quote, no observers besides dealer and buyer | `template Quote` (l.255, `signatory dealer, buyer`) | `TiraiTest.daml:73-77` asserts each rival's `queryContractId` returns `None` and the regulator's `query @Quote` is empty |
| RFQ visible only to the invited panel | `template RFQ` (l.118, `observer invitedDealers`) | `TiraiTest.daml:66-67` (uninvited party cannot quote), `:77` (regulator sees no RFQ) |
| Escrow on quote | `Holding.Lock` (l.58) to `EscrowedHolding` (l.67) | `testTokenInterface` (`TiraiTest.daml:238`): after `Lock`, the standard `HoldingV1` view reports `lock.holders = [buyer]` |
| Escrow cannot be pulled back unilaterally | `EscrowedHolding.DeliverTo` controller `dealer, buyer` (l.99) | `testEscrowNotUnilaterallyReleasable` (`TiraiTest.daml:288`) |
| Reverse-Vickrey award, second price | `RFQ.Award` -> shared `runAuction`, second price and the two-quote minimum | `testHappyPathAndPrivacy` (l.56), `testThreeQuoteVickrey` (l.88), `testSingleQuoteAuctionRefused` (one quote is refused, direct rail settles it), `testCannotShedSecondPrice` (buyer cannot drop to first price) |
| Deterministic winner on a price tie | secondary sort on dealer, l.181 | read the sort key; no dedicated test |
| One quote per dealer per auction | `Award` l.176-178 | `testDuplicateDealerRejected` (l.270) |
| A quote can only settle its own RFQ | `rfqId = Some self` (l.156), checked l.172 | `testCrossRfqRejected` (l.143) |
| Duplicate quote ids rejected | `Award` l.167-168 | `testDuplicateQuoteRejected` (l.155) |
| Counterfeit asset and cash rejected | `assetIssuer` / `payIssuer` checks (l.151, l.282) | `testCounterfeitAssetRejected` (l.299), `testCounterfeitCashRejected` (l.326) |
| Quote deadline | `RFQ.deadline` checked in `SubmitQuote` l.146 | `testQuoteAfterDeadlineRejected` (l.309) |
| Direct bilateral OTC at the ask | `Quote.SettleQuote` (l.273), floor at l.278 | `testDirectOtc` (l.339), including the underpay rejection |
| Partial fill, bilateral | `Quote.AcceptPartial` (l.329) via `DeliverSplit` (l.107) | `testPartialFill` (l.253): 400 of 1000 at exactly 1,700,000 |
| Partial fill, Vickrey | `RFQ.AwardPartial` (l.192) to `SettleQuotePartial` (l.298) | `testPartialVickrey` (l.167) |
| Reject and withdraw return escrow | `RejectQuote` (l.377), `WithdrawQuote` (l.383) | `testRejectQuote` (l.358), `testWithdraw` (l.130) |
| Buyer cancels its own RFQ; nobody else can | `CancelRFQ` (l.249) | `testCancelRfq` (l.370), both directions |
| Selective disclosure, both sides | `DiscloseTo` (l.394), `DealerDiscloseTo` (l.406), `QuoteDisclosure` (l.432) | `testSelectiveDisclosure` (l.188): auditor sees it, rival dealer does not |
| Post-trade only for the regulator | `TradeReport` (l.416, `observer regulator`) | `TiraiTest.daml:84-85`; regulator query for `Quote` and `RFQ` returns `[]` |
| Real CIP-0056 `HoldingV1` interface on both position types | l.33 and l.81 | `testTokenInterface` (l.238) reads through `queryInterface @HoldingV1.Holding` |
| Token-standard cash leg, Vickrey | `RFQ.AwardWithAllocation` (l.223) creating `TokenTrade` (l.494) | `testTokenDvpVickrey` (`TokenSettlementTest.daml:83`) |
| Token-standard cash leg, direct OTC | `Quote.ConvertToTokenTrade` (l.357) | `testTokenDvpDirect` (`TokenSettlementTest.daml:146`) |
| Atomic cross-registry DvP | `TokenTrade_Settle` (l.516): `Allocation_ExecuteTransfer` + `DeliverTo` + `TradeReport` in one choice body | `testTokenDvpVickrey`, `testCbtcDvp` (`TokenSettlementTest.daml:113`) |
| Forged allocation cannot settle | `expectedAllocation` rebuilt from the trade's own fields (l.466), compared l.524-525 | `testAllocationMismatchRejected` (`TokenSettlementTest.daml:198`) |
| Instrument binding end to end | `ConvertToTokenTrade` l.365-368 | `testWrongInstrumentRejected` (`TokenSettlementTest.daml:212`): wrong id and impostor admin both fail |
| Escrow recovery on cancel and expiry | `TokenTrade_Cancel` (l.534), `TokenTrade_Expire` (l.549) | `testTokenTradeCancel` (l.168), `testTokenTradeExpire` (l.186, including the too-early attempt) |
| Wallet-facing standard reject | `allocationRequest_RejectImpl` (l.566) | `testAllocationRequestReject` (`TokenSettlementTest.daml:232`) |
| Asset-agnostic cash leg | `cashInstrument : InstrumentId` (l.502) | `testCbtcDvp` runs the same path under a second registry party with no code change |
| Multi-instrument basket, one sealed price, atomic multi-leg | `BasketRFQ` (l.591), `SubmitBasketQuote` (l.607), `SettleBasket` (l.647) | `testBasket` (`TiraiTest.daml:213`), plus `testWithdrawBasketQuote` (l.393) and `testRejectBasketQuote` (l.403) |

Suite size, counted from source: `TiraiTest.daml` has 22 assertion-bearing
scripts, `TokenSettlementTest.daml` has 8. `daml test` also executes
`Init.daml`'s four seed scripts and the two `setupEnv` / `setupToken` helpers,
which is how the documents arrive at 36. Thirty of the thirty-six carry
assertions. Green status is `[unverified]` here; run `cd test; daml test`.

### 1.2 Deployer and live integration (`scripts/devnet.mjs`, 1250 lines)

| Capability | Where | How it is proven |
|---|---|---|
| Two auth shapes: M2M client credentials and Keycloak password grant, plus a pre-issued bearer | `token()` l.30-68 | read the branch at l.39; `DEVNET_TOKEN` short circuit at l.34 |
| Node-agnostic party resolution (derives from the participant's own namespace, never from the committed file) | `partyMap()` l.141-144, `namespace()` l.129 | comment and code at l.136-140; `verify` uses it at l.327 |
| Survives admin-only nodes (403 on party allocate and rights) | `allocateOne` l.156-162, `grant` l.179 | read the 403 branches |
| Idempotent, duplicate-safe command submission | `submit()` l.203-244, stable `commandId` l.204, `DUPLICATE_COMMAND` and archived-contract handling l.229-237 | read l.226-237 |
| Per-template ACS reads (the node caps a response at 200 elements) | `TEMPLATES` l.304, `acsAs` l.307 | read l.301-303 comment; same fix applied in the desk and MCP |
| On-ledger privacy assertion, exits non-zero on failure | `verify()` l.324-353 | `node scripts/devnet.mjs verify`; it fails on a rival quote, on regulator pre-trade visibility, and on an empty read (l.350) |
| Seeding: single RFQ, basket, settled spread, best-execution attestations, live book | `seed` l.266, `seedBasket` l.404, `seedCases` l.434, `seedBestExec` l.640, `seedBook` l.1071 | each is idempotent against on-ledger state; check the guards at l.272, l.406, l.437, l.643, l.1101 |
| Settlement in Canton Coin through the DSO registry | `seedCc` l.856 with `ccTrade` l.944 | `node scripts/devnet.mjs seed-cc`; funding via `TransferFactory_Transfer` then `TransferInstruction_Accept` (l.898-912), allocation via `AllocationFactory_Allocate` (l.1030-1035), settlement via `TokenTrade_Settle` (l.1047) |
| Settlement in a second, foreign registry (CBTC via the DA Utility Registry) | `seedForeign` l.1184, registry base resolution `registryBase` l.789 | `node scripts/devnet.mjs seed-foreign CBTC`; the registrar is learned from the holding (l.1198), not configured |
| Accepting an inbound token-standard transfer from any registry | `acceptIncoming` l.1150 | `node scripts/devnet.mjs accept-incoming` |
| Round-scoped choice contexts refetched rather than replayed | l.1022-1038 and l.1044-1057 | read the retry loops; the failure mode is documented in `JOURNAL.md:230-236` |
| Orphan-request tidy with a deliberate safety catch | `orphansOf` l.734, `tidy` l.741, `--all` guard l.760 | `node scripts/test-devnet-logic.mjs`, 6 assertions, all pure |
| Live counts on two participants | `README.md:173-176` | `[unverified]`: run `node scripts/devnet.mjs verify` and `ENV_FILE=.env.hackcanton node scripts/devnet.mjs verify` |

### 1.3 Web desk (`web/app.html` 218 lines, `web/app.js` 1453 lines, `web/server.mjs` 170 lines)

Nine views, all wired in `showView` (`app.js:390-410`) and declared in the
sidebar (`app.html:18-26`):

| View | Renderer | What it actually shows |
|---|---|---|
| Active RFQs (home) | `renderActive` l.542, rows from `rfqRows` l.475 | the whole book for the signed-in identity, with All / Mine / For me chips, instrument search, and one action per row decided by `rowAction` l.514 |
| Create RFQ | `renderCreate` l.696 | two execution modes (auction and direct), instrument, quantity, and a settlement rail picker (`railOptions` l.684) |
| My activity | `renderActivity` l.667 | in-session log, appended only after the ledger accepts (`createRFQ` l.1077) |
| Portfolio | `renderPortfolio` l.822 plus `renderRegistryAssets` l.936 | your own holdings only, plus balances read through the standard `HoldingV1` interface (`registryAssets` l.848) |
| Settlement rails | `renderRails` l.891 | one row per `{admin, id}` the desk holds, with known registrars labelled at l.885-889 |
| Audit trail | `renderAudit` l.948 | regulator's `TradeReport` and `BasketTradeReport`, plus every `QuoteDisclosure` |
| Best execution | `renderBestExec` l.724 | clearing price against every disclosed ask, per unit, with an explicit "ambiguous" verdict when an instrument settled more than once (l.744) |
| Verify privacy | `renderVerify` l.770 | live per-node contract counts and a leak contrast table |
| Side-by-side proof | `.desk` in `app.html:86-129` | all three columns at once, explicitly labelled as something no deployed venue would show |

Actions the UI can actually drive, each a real command submission:

| Action | Function | Choice |
|---|---|---|
| Open a request | `createRFQ` l.1052 | `CreateCommand RFQ` |
| Seal a quote | `submitQuote` l.1088 | `SubmitQuote` |
| Award | `award` l.1219 | `Award` |
| Award partial | `awardPartial` l.1233 | `AwardPartial` |
| Accept at ask | `acceptQuote` l.1108 | `SettleQuote` |
| Partial fill | `partialFill` l.1122 | `AcceptPartial` |
| Reject a quote | `rejectQuote` l.1264 | `RejectQuote` |
| Withdraw a quote | `withdrawQuote` l.1167 | `WithdrawQuote` |
| Cancel an RFQ | `cancelRFQ` l.1249 | `CancelRFQ` |
| Disclose (buyer) | `discloseQuote` l.1139 | `DiscloseTo` |
| Disclose (dealer) | `dealerDiscloseQuote` l.1153 | `DealerDiscloseTo` |
| Open a basket | `createBasketRFQ` l.1182 | `CreateCommand BasketRFQ` |
| Quote a basket | `quoteBasket` l.1196 | `SubmitBasketQuote` |
| Settle a basket | `settleBasket` l.1208 | `SettleBasket` |
| Withdraw / reject a basket | l.1275, l.1286 | `WithdrawBasketQuote`, `RejectBasketQuote` |

That is fifteen of the model's twenty-two exercisable choices. The seven the UI
never exercises are listed in section 2.

Proven by: `npm run e2e` (`scripts/e2e.mjs`, 28 checks), `npm run e2e:actions`
(23), `npm run e2e:bestexec` (8), `npm run e2e:shell` (23), `npm run e2e:paths`
(29), `node scripts/e2e-hosted.mjs` (29 checks per engine across three engines,
87). Those counts are counted from the source `check`/`say`/`ok` calls and match
the README's test table, `e2e:paths` included. Every local suite here was run
green on 27 August against a fresh `npm run demo`, one clean sandbox per suite —
the ledger is stateful, and a suite run on another suite's leftovers reports
failures that are not real.

### 1.4 Agent surface (`mcp/server.mjs`, 300 lines)

| Tool | Definition | Behaviour |
|---|---|---|
| `explain_desk` | l.125 | static text, no ledger call |
| `list_settlements` | l.131 | regulator's `TradeReport` and `BasketTradeReport` |
| `party_view` | l.136 | per-party contract counts, the privacy proof for an agent |
| `market_snapshot` | l.145 | open RFQs, sealed quotes in flight, settled trades |
| `best_execution` | l.150 | same attestation logic as the desk, including the ambiguity guard (l.238-241) |
| `post_rfq` | l.155, handler l.256 | a real write: creates an `RFQ` on Devnet with the operator's local credentials |

Hardening worth noting: `resolveParty` (l.118) refuses any party that is not one
of this desk's own, because the shared validator's machine user holds `CanActAs`
on other teams' parties. `post_rfq` validates the ticker shape (l.261) and the
quantity range (l.272).

Proven by `node scripts/e2e-mcp.mjs`: 25 checks, which I counted in the source
and which matches the README's `25 / 25`. Result `[unverified]`, needs live
Devnet.

### 1.5 Infrastructure

| Capability | Where | How it is proven |
|---|---|---|
| Hosted read-only proxy: write paths denied before a token is ever minted | `api/proxy.mjs`, `ALLOW` l.42-45, gate l.77 | `node scripts/test-readonly-proxy.mjs`, 14 assertions, no network needed |
| Query scoping on a shared validator, including the `filtersForAnyParty` bypass | `proxy.mjs:83-94` | same suite, assertions at l.37-40 |
| `/v2/parties` deliberately not proxied | `proxy.mjs:40-41` | same suite, l.29 |
| Local dev server, loopback-bound, token injected server side, SSE push | `web/server.mjs` l.15, l.120-130 | read the bind at l.168 |
| Path-traversal guard on static files | `web/server.mjs:159-160` | read it |
| One-command local demo (sandbox, seed, desk) | `scripts/demo-local.mjs` | `npm run demo` |
| Autonomous market-maker agent with a self-checking demo | `scripts/agent.mjs`, `quotePass` l.101, `demo` l.120 | `npm run agent:demo`; the demo asserts the Vickrey clearing price and idempotence (l.176-180) |
| Inbound-transfer watcher | `scripts/watch-incoming.mjs` | `node scripts/watch-incoming.mjs once` |
| CI: Daml build and test, `node --check` on every script, both self-checks | `.github/workflows/ci.yml` | the workflow file |
| Generated submission assets (PDFs, logos, social) | `scripts/make-pdf.mjs`, `make-logo.mjs`, `make-social.mjs` | `npm run pdf`, `npm run logo`, `npm run social` |

---

## 2. Built but shallow

**The token-standard rail exists only in the deployer.**
`AwardWithAllocation`, `ConvertToTokenTrade` and `TokenTrade_Settle` are reachable
from exactly one place outside the Daml tests: `scripts/devnet.mjs`
(`ccTrade` l.944). The web desk never exercises them, and `mcp/server.mjs` never
mentions them. The flagship capability of this build can only be demonstrated
from a terminal by the operator. *To finish:* a UI settle path (see section 4).
*Cost:* an evening for a local-only path, more if it must work on the hosted
read-only deployment.

**A rail-bound RFQ created in the UI is a dead end in the UI.**
`createRFQ` (`app.js:1058-1072`) lets the buyer pick a registry rail and sets
`payIssuer` to that registrar. From then on `renderBuyer` (l.244-253) looks for a
`Tirai:Holding` whose `instrument` matches `payInstrument`, which for a registry
asset never exists, so Award and Accept simply do not appear. The buyer is given
a rail chooser leading to a request the same screen cannot settle. *To finish:*
either hide the rail chooser or build the settle path. *Cost:* ten minutes to
hide it, an evening to build it.

**`TokenTrade` is read but never rendered.**
It is in the desk's read groups (`app.js:65`) and MCP's (`server.mjs:93`), yet no
renderer anywhere mentions it. A trade awaiting allocation is invisible on every
screen. *To finish:* one row in the book plus a status pill. *Cost:* under an
hour.

**Best execution matches disclosures to trades by instrument only.**
`QuoteDisclosure` (`Tirai.daml:432`) carries no auction identifier, so both the
desk (`app.js:734-746`) and MCP (`server.mjs:238-241`) refuse to attest when an
instrument settled more than once. The honesty is good; the attestation is
therefore only ever available on instruments the seeders deliberately keep
unique. *To finish:* an `rfqId` field on the disclosure. *Cost:* an hour of
model work, plus a package bump and a reseed on two participants.

**Baskets are bilateral only.**
`Tirai.daml:581` states it: "Direct bilateral settle (basket auctions are
future)." There is no basket Vickrey, no basket partial fill, no basket token
rail, no basket in `best_execution`, and `BasketRFQ` has no cancel choice (the
deployer archives the shell instead, `devnet.mjs:750`). *To finish:* mirror
`Award` for baskets. *Cost:* a day, and it multiplies the test matrix.

**Identity is a switcher, not authentication.**
`setActing` (`app.js:434`) swaps which party's node is read, and every write goes
out under one ledger user that holds `CanActAs` on all six parties. This is
honestly labelled in the code (l.421-424) and in the README, but it means the
product path has never been exercised under separate credentials. *To finish:*
per-party tokens. *Cost:* a week, and it depends on the hosting venue.

**The MCP write tool is one hardcoded shape.**
`post_rfq` (`server.mjs:256-288`) always invites `dealerA` and `dealerB`, always
sets `payIssuer` to the desk's mock cash issuer, and always uses a fixed
2030 deadline. An agent cannot quote, award, disclose or settle. *To finish:* a
`quote_rfq` tool over the existing `quotePass` logic. *Cost:* two to three hours.

**The auto-quoting agent does not speak MCP.**
`scripts/agent.mjs` talks to the JSON Ledger API directly. Its `demo` mode
allocates six fresh parties (l.125-126), so it cannot run on a participant where
allocation is admin-only, and `watch` (l.186-191) has no self-check at all.
*To finish:* route it through the MCP server, or at least add one assertion to
`watch`. *Cost:* two hours.

**Cash must be a single holding.**
`Award` and `SettleQuote` take one `cashCid`. The UI detects the split-cash case
and explains it (`app.js:240-249`), and the comment concedes "a production build
would add a `Holding.Merge` choice". *To finish:* that choice, roughly ten lines.
*Cost:* an hour plus the same package bump as anything else in the model.

**The RFQ deadline binds quoting only.**
`SubmitQuote` checks it (`Tirai.daml:146`); `Award`, `AwardPartial`,
`AwardWithAllocation`, `SettleQuote` and `AcceptPartial` do not. An expired RFQ
can still be awarded, and nothing sweeps expired requests. *To finish:* one
`getTime` assertion per settlement choice, or a deliberate decision that the
deadline governs entry only. *Cost:* an hour.

**Incoming registry assets need a manual accept.**
`seedCc` notes it inline (`devnet.mjs:906`): "no pre-approval for the receiver: it
accepts explicitly". `accept-incoming` (l.1150) is a separate command an operator
runs, and it needs the registry's API base supplied out of band via
`REGISTRY_URL` (l.788). *To finish:* a transfer pre-approval, if the registries
support one. *Cost:* unknown until checked; see section 4.

**Only two registries have ever been used, and only by the operator.**
Canton Coin (DSO) and CBTC (DA Utility Registry). cETH and USDCx have never moved
anything, anywhere, including in tests: `TokenSettlementTest.daml` uses mock
registries labelled `cETH` and `CBTC`, and the string `USDCx` does not appear in
any `.daml`, `.mjs` or `.js` file.

**`hackcanton-01` is a second deployment that cannot be kept live.**
It issues three-hour user tokens (`README.md:183-185`), so its state can only be
re-verified by a human pasting a fresh bearer. Its reported counts differ from the
5N node's and neither set is reproducible without that step.

**CI does not run the browser suites or the ledger suites.**
`.github/workflows/ci.yml` runs `daml build`, `daml test`, `node --check`, and the
two pure self-checks. The 87 hosted checks, the 25 MCP checks and the five local
Playwright suites are manual. *To finish:* a nightly workflow calling
`e2e-hosted.mjs` against the live URL. *Cost:* an hour, and it needs the site to
be up.

---

## 3. Claimed but not built

### 3.1 The fee model. There is no fee anywhere in the ledger.

`grep -n "fee\|bps" daml/Tirai.daml` returns nothing. No template carries a fee
field, no choice takes a fee leg, no party is a venue. Nor is there any CIP-0047
activity marker anywhere in the codebase.

Claims that state or imply otherwise:

| File and line | Claim |
|---|---|
| `SUBMISSION.md:22-23` | "Tirai is a trading venue with real price discovery, real settlement and a real fee model." |
| `SUBMISSION.md:60-62` | "A per-trade venue fee in the settlement asset (bps of notional), taken atomically at settlement ... now enforced by the contract rather than invoiced." |
| `SUBMISSION.md:62-64` | "Featured-app activity markers (CIP-0047) accrue network rewards on every settlement, so a live desk keeps earning from the volume it clears." |
| `SUBMISSION.md:99-100` | "turn on the per-trade venue fee and featured-app markers" (implies they exist and are switchable) |
| `deck/index.html:278` | slide heading: "A venue fee the contract collects itself" |
| `deck/index.html:280-286` | "Per-trade fee / Basis points of notional ... if the trade settles, the fee is paid" and the CIP-0047 rewards card |
| `DECK-SCRIPT.md:110-118` | the spoken version of the same slide |
| `deck/NOTES.md:145` | "Plus CIP-0047 featured-app markers accruing network rewards" |
| `PITCH.md:133-136` | "A per-trade venue fee ... taken atomically ... No invoicing, no collection risk." |
| `PITCH.md:147` | "Fee = bps of notional in the settlement asset, taken atomically; CIP-0047 activity ..." |
| `PITCH.md:327-331` | the long-form answer, same claim |
| `PITCH-QA.md:232-234` | the same, though `PITCH-QA.md:236-237` immediately corrects it |

**Closed.** When this inventory was written, only two documents stated the truth and every
other one read as though the fee shipped — a judge reading `SUBMISSION.md` alone would have
been misled. The gap was closed the direct way: the fee was built, deployed as an upgrade,
and settled once on the validator. The rows above are kept because the reasoning that found
the gap is worth more than the gap. What replaced it is a smaller and more specific
limitation, now stated in the deck and in both Q&A documents: the fee is not taken on the
registry rail, because Canton Coin and CBTC move through the issuer's allocation and never
become a holding this desk can split.

### 3.2 cETH and USDCx settlement

| File and line | Claim | Reality |
|---|---|---|
| `SUBMISSION.md:3-4` | "settling in real CIP-0056 assets (cETH, CBTC, Canton Coin, USDCx)" | Canton Coin and CBTC only. cETH exists as a mock instrument name in `TokenSettlementTest.daml:29`. USDCx appears in no source file at all. |
| `SUBMISSION.md:52-54` | "Settlement clears in cETH, CBTC, Canton Coin or USDCx ... cETH/CBTC drive the actual value movement to the winning dealer." | cETH has moved nothing. |
| `SUBMISSION.md:80-83` | "every settlement is a real CIP-0056 `Allocation_ExecuteTransfer` of cETH/CBTC to the winning dealer" | Most settlements on the ledger are mock `Tirai:Holding` transfers through `Award` / `SettleQuote` / `AcceptPartial`. Eight settlements used an allocation (six CC, two CBTC), zero in cETH. |
| `README.md:60-61` | "the cash leg is a real registry asset, cETH (onRails), CBTC (BitSafe), Canton Coin, or USDCx" | Same. The README does correct itself at l.165. |

### 3.3 Documents contradicting each other about what is live

| File and line | Claim | Contradicted by |
|---|---|---|
| `SUBMISSION.md:166-167` | "What's pending (honest): Live cETH/CBTC transactions on Devnet, blocked on the ... test-token grant (contract path built and tested against a mock)" | `SUBMISSION.md:118-122` in the same file, which reports CBTC settled live, and `README.md:115-123` |
| `SUBMISSION.md:168` | "What's pending: Demo video (5 min, own voice)" | `SUBMISSION.md:12`, which links the finished video |
| `VALIDATION.md:13-14` | "Live cETH/CBTC transactions remain blocked on the test-token grant." | `README.md:161-164`, `JOURNAL.md:191-228` |
| `VALIDATION.md:310-312` | "No live cETH/CBTC transactions yet. ... live settlement is blocked on the test-token grant." | Same. `VALIDATION.md` predates the Canton Coin and CBTC work and was never updated. |

### 3.4 Smaller overstatements

- `README.md:80-83`: "the buyer's wallet (Canton Loop, Console, ...) renders it as
  *allocate clearingPrice cETH to this settlement* with no Tirai-specific
  integration." The `AllocationRequest` interface instance is real
  (`Tirai.daml:558`), but no wallet has ever been pointed at it. `[unverified]`:
  open a `TokenTrade` in Canton Loop or Console against the 5N deployment and see
  what renders.
- `README.md:140`, `README.md:193`, `VALIDATION.md:9`: "44 Daml test scripts".
  Thirty-eight scripts execute; six of them are seed and helper scripts with no
  assertions.
- Was: the README's test matrix omitted `npm run e2e:paths`. It lists it now, at
  29 assertions, most of them about refusals.
- `README.md:153-154`: "Create RFQ ... with a choice of settlement rail" is true
  as written but omits that a rail-bound request cannot then be settled from the
  desk.
- Live counts in `README.md:173-176`, `SUBMISSION.md:140-154` and the deck are
  reseed-sensitive and cannot be checked from the tree. `[unverified]`: run
  `node scripts/devnet.mjs verify` on each node and count the printed template
  totals.

---

## 4. Worth building next, ranked by value per hour

A structural note first: items 2, 3, 5 and 7 all change `daml/Tirai.daml`, which
means a new package id, a fresh DAR upload and vetting on both participants, and
a reseed. The live desk reads contracts of the current package id, so it will
show an empty book until reseeded. Do the model changes as **one** bump, not
four.

**1. Render `TokenTrade` in the book, read-only.** About an hour.
The desk already fetches it. One row that says "awaiting allocation", with the
instrument, the clearing price and the cash instrument, makes the token rail
visible in the product instead of only in a terminal. A judge asking "where is
the cETH trade in your UI" currently has no answer. Risk: near zero, it is a
read.

**2. Settle a rail-bound RFQ from the desk.** One evening for the local path.
The write itself is three commands (`AwardWithAllocation`,
`AllocationFactory_Allocate`, `TokenTrade_Settle`), all already implemented in
`devnet.mjs:944-1058`. What is missing is a server-side registry helper: the
allocation and execute-transfer choice contexts come from a registry HTTP API and
carry disclosed contracts, which the browser cannot fetch itself. Add two
endpoints to `web/server.mjs` that proxy `allocation-instruction/v1/...` and
`allocations/v1/{cid}/choice-contexts/...`, then reuse the deployer's logic.
Risk: the hosted desk must stay read-only, so this is a local-demo capability
only, and the `ALLOW` list in `api/proxy.mjs` must not grow. Contexts are
round-scoped, so the client has to refetch on retry exactly as the deployer does,
or it will fail with "contract has been archived" in front of an audience.

**3. A fee field.** Half a day of code, plus the redeploy and reseed.
This is the largest credibility gap, and it is the only item here that closes a
claim already printed on a slide. The laziest version that is honest: add
`venue : Party` and `feeBps : Int` to `RFQ` (carried onto `Quote` and
`TokenTrade`), then in `SettleQuote`, `SettleQuotePartial`, `AcceptPartial`,
`SettleBasket` and `TokenTrade_Settle` split one more leg to the venue inside the
same transaction. What it breaks: every expected balance in `TiraiTest.daml` and
`TokenSettlementTest.daml` changes; the token rail needs the fee as a second
`TransferLeg` in `expectedAllocation`, which is a real design decision rather than
a field (an allocation covering two receivers, or a separate venue allocation);
and `Award` becomes harder to reason about with a partial fill. Do not ship it
half-done: a fee that only works on the mock cash rail would make the deck's claim
worse, not better, because the deck's claim is specifically about the settlement
asset. If time is short, the better move is to change the four documents in
section 3.1 to match `PITCH-QA-DECK.md:249` and keep the honest answer.

**4. An agent that quotes over MCP.** Two to three hours.
`quotePass` (`scripts/agent.mjs:101`) already does the work. Expose it as a
`quote_rfq` MCP tool alongside `post_rfq`, with the same `resolveParty` guard and
a price argument. Two agents, one posting and one quoting, both over MCP, is a
demonstrable story that costs almost nothing because both halves exist. Risk: it
is a second write tool on a server that is deliberately mostly read-only, so keep
it local-credentials-only exactly as `post_rfq` is (`mcp/server.mjs:8-11`), and
extend `scripts/e2e-mcp.mjs` so the write is covered.

**5. A per-auction link on `QuoteDisclosure`.** An hour of model work, inside the
same package bump.
Add `rfqId : Optional (ContractId RFQ)` to `QuoteDisclosure` and pass it from
`DiscloseTo` / `DealerDiscloseTo`. Best execution then attests per auction instead
of refusing whenever an instrument settled twice, which is the common case on a
seeded ledger. Both the desk (`app.js:744`) and MCP (`server.mjs:246`) can drop
their ambiguity branch. Risk: low, additive, `Optional` keeps it
upgrade-friendly.

**6. Per-dealer analytics.** One to two hours, no model change.
From contracts the buyer and regulator nodes already hold: quotes submitted per
dealer, win rate, average distance from clearing, average time from RFQ to quote
(needs a created-at, so use the ledger offset ordering or accept "count only" for
now). This is the first thing a design partner asks for and it is pure rendering
over data the desk has already fetched. Risk: none beyond another view to keep
correct; keep it inside the acting identity's own ACS so it does not quietly leak
what the ledger does not.

**7. Cheap model tidy-ups, bundled with item 3.**
`Holding.Merge` (removes the split-cash dead end the UI currently has to explain,
`app.js:240-249`); a deadline assertion in the settlement choices; a `CancelRFQ`
equivalent on `BasketRFQ` so the deployer does not need the raw `Archive`
(`devnet.mjs:750`). Each is minutes of code and none is worth its own redeploy.

**8. A real transfer pre-approval.** Unknown until probed, budget half a day.
`seedCc` accepts transfers explicitly because the receiver has no pre-approval
(`devnet.mjs:906`). Splice defines a `TransferPreapproval`, but whether the DSO
registry and the DA Utility Registry expose a way to create one for an arbitrary
party on Devnet is `[unverified]`. Check first:
`GET {registryBase}/metadata/v1/info` and look at `supportedApis` for a
transfer-preapproval entry, and search the Splice release DARs in `dars/` for the
interface. Value is operational rather than demonstrable: it removes a manual
step from onboarding a new registry asset.

**9. Multi-currency best execution.** Last, and probably not at all.
Comparing a cETH ask against a CBTC ask needs a price source the project does not
have and should not invent. Anything built here would be a hardcoded rate wearing
a suit. The honest version is per-rail best execution, which already works.

---

## 5. Deliberately not built, and why

**A trusted auctioneer, and in-place multi-round RFQ.** `[unverified] in this
repository.` I searched `JOURNAL.md`, all 66 commits, and the full working tree:
the strings "auctioneer" and "multi-round" do not appear anywhere, and
`git log --all -S auctioneer` returns nothing. If those experiments happened, they
happened in [Bisik](https://github.com/PugarHuda/bisik), whose history is not part
of this repository (`bde6014` is a fresh initial commit). To recover the reasons,
run `git log -S auctioneer --oneline` and `git log -S Round --oneline` in a clone
of the Bisik repo, then copy the finding into `JOURNAL.md` so it is on the record
here. Until that is done, do not assert it on stage.

What this repository does record as deliberately dropped or refused:

| Decision | Where | Reason as given |
|---|---|---|
| A native re-implementation of the token standard | `JOURNAL.md:36-58`, commit `d540bbb` | It was "shaped like CIP-0056" but useless against a real registry, which implements against Splice package ids. Keeping a fake beside the real thing is how a reviewer reads the wrong one. Deleting it also removed the in-package interface upgrade wall. |
| The venue fee, and the bps rate | `PITCH-QA-DECK.md:249`, `PITCH.md:149` | "I will not claim a line of code that does not exist. It stays unbuilt on purpose until a partner tells me the number, because building the collection before knowing the rate is the wrong order of work." |
| Writes on the hosted desk | `api/proxy.mjs:1-11`, l.42-45, l.77-78 | A public URL must never drive the ledger; the privileged token stays server side. |
| `/v2/parties` on the hosted proxy | `api/proxy.mjs:40-41` | Exposing the shared validator's full party list (every other team's ids) serves no purpose. |
| An MCP server that can do more than post an RFQ | `mcp/server.mjs:8-11` | Writing is "a deliberate, locally-run capability, not something exposed to the internet". |
| The three-column view as the home screen | `app.js:392-397`, commit `decd8be` | "A deployed desk shows you one identity, not everyone's at once." It survives as a labelled proof view. |
| Other parties' books in Portfolio | `app.js:833-836` | Rendering them "would have been the app leaking what the ledger does not". |
| Basket auctions | `Tirai.daml:580-581` | Explicitly future work; baskets settle bilaterally so the additive change touched nothing in the core RFQ path. |
| `tidy` cancelling every quote-less RFQ by default | `devnet.mjs:757-764` | "It has happened once" and gutted the live book, so the destructive form now requires `--all`. |
| `verify` allocating parties as a side effect | `devnet.mjs:325-327` | A check must not write; going through `parties()` would have made a verification allocate and grant. |
| The `/deck` route on the hosted site | `JOURNAL.md:188-189`, commit `f639319` | No slide deck ships in the web app, so the rewrite only produced 404s in hosted QA. |
| Recorder and subtitle tooling nothing called | commit `9931d72` | Dead code. `scripts/record-demo.mjs` survives because `npm run record:demo` uses it. |
| Tier-one banks and incumbent venues as first design partners | `VALIDATION.md:116-121` | Neither will engage a solo builder with a DevNet deployment inside a quarter; pursuing them consumes the whole quarter producing nothing falsifiable. |
| Three simultaneous pilots | `VALIDATION.md:238-240` | "Running three simultaneous pilots as a solo builder produces three abandoned pilots." |
| Any cryptographic privacy machinery | `README.md:25-39`, `app.js:818` | Four earlier builds needed a TEE, ZK circuits, threshold encryption and FHE. On Canton the same guarantee is a `signatory`/`observer` declaration, so none of it was rebuilt. |

---

## Verification cheat sheet

```
cd test; daml test                                # the model, 42 scripts
node scripts/test-readonly-proxy.mjs              # 14, no network needed
node scripts/test-devnet-logic.mjs                # 6, no network needed
node scripts/devnet.mjs verify                    # privacy, on the live 5N node
ENV_FILE=.env.hackcanton node scripts/devnet.mjs verify
node scripts/e2e-mcp.mjs                          # 25, live Devnet, leaves one RFQ
node scripts/e2e-hosted.mjs                       # 87, against tirai.vercel.app
npm run demo                                      # then e2e / e2e:actions /
                                                  # e2e:bestexec / e2e:shell / e2e:paths
grep -n "fee\|bps" daml/Tirai.daml                # returns nothing
```
