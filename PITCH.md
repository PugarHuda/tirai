# Tirai — Grand Final pitch pack

HackCanton Season #2 Grand Final · Wednesday 5 August 2026, 14:00 UTC · live, **4 minutes**,
in the organisers' prescribed four-block structure. 18 teams reached the final, so the first
fifteen seconds carry more weight than the last sixty.
Builder: Pugar Huda Mantoro (team **Diam**), solo.

Everything spoken here is checkable in this repo, including the Canton Coin settlements:
six trades, four reverse-Vickrey and two direct OTC, 60,900 CC moved to the winning dealers
through the DSO-run registry on the DevNet validator.

**Judges' written feedback, for reference:**

> "One of the strongest Canton-native builds — sealed dealer quotes, multiple execution
> modes, selective best-execution disclosure and genuine Token Standard allocation make the
> privacy and settlement thesis concrete. Proof-first: live privacy verifier, two DevNet
> deployments, best-execution attestations. To sharpen before the final: real cBTC/cETH
> settlement through an external CTS issuer, customer validation, and a clearer product
> differentiation. Secure one design partner and run the 90-day validation plan."

The pitch below answers those three asks in order: real external issuer first, then
differentiation, then the validation plan and the design-partner ask.

---

## 1 · The 4-minute pitch — four 60-second blocks

The organisers prescribed the structure: **Problem · Solution & product · Market & business
model · Demo & team**, sixty seconds each.

Speak slowly. Short sentences. Pause at every full stop. Every block is written to roughly
130–145 spoken words, which is under sixty seconds at a comfortable non-native pace — the
slack is deliberate, because four minutes goes fast and they will cut you off.

**Rules for the day.** Do not run over into the next block; each one has to land on its own.
If a block starts to overrun, jump to its last line and move on. Never skip block 4 — that
is where the proof is.

---

### Block 1 · 0:00 – 1:00 · The problem

**On screen:** https://tirai.vercel.app — the landing page hero. Do not scroll. Let the line
"Whisper your quotes. The market hears nothing." be visible while you say the first sentence.

*(~140 words)*

> A bank wants to sell fifty million of bonds. Before it trades, it must ask dealers for a
> price.
>
> But the question itself is the information. The moment anyone sees you asking, they know
> your size and your direction. The price moves against you before you trade.
>
> So how do institutions solve this today? Badly.
>
> A public order book, or an on-chain RFQ, leaks everything. Your request is a transaction.
> The competing quotes are transactions. Your rivals simply read them.
>
> A voice broker or a chat room is private — but leaves no record. Six months later you
> cannot prove to your compliance team that you got the best price available.
>
> That is the trap. You get privacy, or you get proof. Never both. Which is why block
> trading in 2026 still happens on the telephone.

**The fifteen seconds that matter:** the first two sentences. Land "the question itself is
the information" cleanly and the rest of the pitch has a spine.

---

### Block 2 · 1:00 – 2:00 · Solution and product

**On screen:** click through to https://tirai.vercel.app/app — the three-column desk. Point
at the buyer column, then the two dealer columns, as you describe them.

*(~145 words)*

> Tirai gives you both. My name is Pugar. *Tirai* is Indonesian for curtain — price
> discovery happens behind it.
>
> It works like the dealer terminal institutions already use, but on-ledger. A buyer asks a
> chosen panel of dealers for a price. Each dealer answers with a sealed quote. Quoting
> locks that dealer's bond into escrow — so a price is a commitment, not a bluff.
>
> Dealer A cannot see dealer B's quote. Not hidden by the interface. Dealer B's node never
> received it.
>
> The cheapest ask wins, and is paid the second-cheapest price — so quoting honestly is the
> dealer's best strategy. Losing quotes are archived, never revealed to anyone.
>
> Here is the superpower. On four other chains I built this with zero-knowledge circuits,
> trusted hardware, threshold encryption, homomorphic encryption. On Canton, that is a
> `signatory` and `observer` declaration. Privacy is the ledger model — not cryptography
> bolted on.

---

### Block 3 · 2:00 – 3:00 · Market and business model

**On screen:** the desk's stats strip, or the "Audit trail" tab showing settled trades.
Keep it simple — this block is spoken, not shown.

*(~140 words)*

> Who buys it. Fixed-income and crypto-asset trading desks — at banks, asset managers and
> prop shops — that move tickets between one and a hundred million and cannot afford to
> signal. Below a million, leakage is a rounding error and a public venue is fine. Above it,
> leakage is the whole cost. And alongside the desks, the venues that would host Tirai as an
> embedded app: Temple, Bron, Console, Canton Loop.
>
> How it makes money. A per-trade venue fee, basis points of notional, in the settlement
> asset — collected atomically inside the settlement transaction. If the trade settles, the
> fee is paid. No invoicing, no collection risk. On top, CIP-0047 featured-app markers accrue
> network rewards on every settlement.
>
> How big. Fee on notional means one desk clearing institutional size is a real business,
> and tokenised bond issuance is the growth curve underneath it.

**Grounding notes — read before you speak this block.**

- Ticket range **$1m–$100m** and the "below $1m it is a rounding error" line: grounded, from
  the ICP document in `scripts/make-pdf.mjs`.
- ICP (desks at banks, asset managers, prop shops) and the hosting venues (Temple, Bron,
  Console, Canton Loop): grounded, `SUBMISSION.md`.
- Fee = bps of notional in the settlement asset, taken atomically; CIP-0047 activity
  markers: grounded, `SUBMISSION.md`.
- **The bps number itself is deliberately not stated — it is not set.** If asked, say so:
  it comes out of the design-partner conversation, not out of your head.
- **[assumption]** Any total-market or revenue figure. There is no TAM number in this repo.
  Do not invent one live. If a judge presses for market size, give the shape, not a figure:
  "fee on notional, institutional ticket sizes, and I would rather size that with a design
  partner than guess at it."

---

### Block 4 · 3:00 – 4:00 · Demo and team

**On screen, in this order — pre-open these tabs:** the desk's **Verify privacy** tab (green
verdict), then **Best execution**, then `daml/Tirai.daml` at `TokenTrade_Settle` or the
terminal scrollback of the Canton Coin settlement.

*(~145 words)*

> I am a solo builder. This is the fifth time I have built this product — and the first time
> the chain did the hard part for me.
>
> What is already live. Deployed on two Canton DevNet participants, same package id —
> including HackCanton's own node. Forty-seven settled trades and five atomic baskets. Thirty-
> six Daml test scripts green.
>
> This view is not a claim. It queries what each party's node actually holds, right now.
> Each dealer sees only its own quotes. The regulator sees zero contracts before settlement.
>
> And there is no order book — yet sixteen attestations prove the buyer beat every competing
> ask, from quotes selectively disclosed to the regulator.
>
> Your feedback asked for real external settlement. Done: the cash leg now settles in real
> Canton Coin, through the DSO-run Token Standard registry. An issuer I do not control. cETH
> and CBTC are the same code path.
>
> I need one design-partner desk. Tirai — you whisper quotes, the market hears nothing.

**The number is confirmed:** say "six trades settled in real Canton Coin" after "an issuer I
do not control" — one clause, nothing more. (Four reverse-Vickrey, two direct OTC, 60,900 CC
moved to the winning dealers; reproducible with `node scripts/devnet.mjs seed-cc`.)

**If block 4 runs long,** cut the sentence beginning "And there is no order book" — the
attestations come up again in Q&A.

---

### The ask, if they give you a closing line or a Q&A opener

Three things, in this order of value to you:

1. An introduction to **one** fixed-income or crypto-native trading desk as a design partner
   — one hour a week for ninety days, not a purchase order.
2. The **cETH and CBTC test-token grants** from onRails and BitSafe. The code path is built
   and tested; it is a grant, not a build.
3. A **hosting venue** so the per-trade fee and the featured-app markers can be switched on
   in a supervised pilot.

---

## 2 · The 60-second cut (fallback)

Use this only if the slot is shortened again on the day, or if you are cut off and offered a
recap. Roughly 150 words — the four blocks compressed into one. Keep the desk on screen the
whole time; switch to "Verify privacy" at the 25-second mark.

> When a bank wants to move a large block of bonds, the question itself is the information.
> Ask, and the market moves against you. That is why block trading is still on the phone.
>
> Tirai is that dealer terminal, on-ledger. A buyer asks a chosen dealer panel. Each quote
> is sealed — a rival dealer's node never receives it. Cheapest ask wins, pays the second
> price. Losing quotes are archived, never revealed.
>
> Here is the proof, live on Canton DevNet. Each dealer sees only its own quotes. The
> regulator sees nothing before settlement — and sixteen attestations prove the buyer beat
> every competing ask, with no public order book.
>
> And the cash leg is real. Canton Coin, through the DSO's own Token Standard registry.
> Atomic delivery versus payment.
>
> I need one design partner desk. Tirai — you whisper quotes, the market hears nothing.

---

## 3 · Clear product differentiation

### Say this verbatim

> Tirai is not a DEX and it is not a chat room. It is the sealed-bid RFQ layer that
> institutional block trading already runs on — Tradeweb, Bloomberg, MarketAxess — rebuilt
> so that the confidentiality is enforced by the ledger instead of by a company's database.
> The difference from every public venue is that competing dealers never receive each
> other's prices, and the difference from voice and chat broking is that the confidential
> auction still produces a machine-checkable best-execution proof afterwards. The difference
> from other Canton privacy demonstrations is that Tirai does not stop at showing that
> Canton can keep a secret: it runs a real price-discovery mechanism, three execution rails,
> and settles the cash leg through an external Token Standard registry that I do not
> control. In short — private price discovery with a receipt.

### Comparison

| | **Tirai** | Public-orderbook DEX / on-chain RFQ | Voice / chat OTC broker | Other Canton privacy demos |
|---|---|---|---|---|
| Pre-trade visibility to rivals | None — quote is signatory dealer + buyer only | Full: the order or quote is a public transaction | None | Usually none, but often only a single bilateral contract |
| Price discovery mechanism | Reverse-Vickrey second price, direct OTC lift, partial fills on both | Continuous order book or public auction | Human negotiation, no formal mechanism | Typically no mechanism — the demo is the privacy |
| Losing quotes | Archived unrevealed (`RejectQuote`) | Public forever | Verbal, unrecorded | n/a |
| Best-execution proof | Machine-checkable from disclosed sealed asks — 16 attestations live | Implicit from the public book | Manual, reconstructed from chat logs months later | n/a |
| Regulator view | Post-trade only, on-ledger, zero pre-trade | Everything, always | Nothing, unless subpoenaed | Rarely modelled |
| Settlement | Atomic DvP, cash leg through an external CTS registry (real Canton Coin) | Atomic, but public | T+1/T+2, separate legs, settlement risk | Usually no settlement leg |
| Counterparty risk at quote time | Escrowed on quote (`Lock` → `EscrowedHolding`) | Collateral or none | Full, until settlement | n/a |

### What Tirai does **not** do

Say these out loud if a judge probes — volunteering them is stronger than being caught.

- **No live cETH or CBTC transaction yet.** The code path is identical to the Canton Coin
  path that now works; only the instrument administrator differs. It is blocked on the
  onRails and BitSafe test-token grants, not on engineering.
- **No mainnet.** DevNet only. Two participants, same package id.
- **The hosted desk is read-only.** Writes are deliberately rejected with 403. To see an
  award or a settlement you run it locally, or watch the demo video.
- **No paying customer and no signed design partner.** Zero revenue. The fee model is
  designed and priced, not collected.
- **No continuous market, no liquidity provision, no matching engine.** Tirai does not make
  markets. It is request-driven only.
- **No credit or netting layer.** Every trade is fully collateralised at quote time. That is
  safer, but it is capital-inefficient compared with how real dealers actually work.
- **No custody, no KYC, no onboarding stack.** A hosting venue brings those.
- **Not a general privacy framework.** It is one product — an RFQ desk — not a toolkit.

---

## 4 · Anticipated Q&A

Answer in one or two sentences, then stop. Do not fill silence.

**Q1. Why Canton, and not ZK, TEEs or FHE? You could have built this anywhere.**
I did build it everywhere — four times, and this is the fifth. Diam on Arbitrum with iExec
TEEs, Segel on Stellar with two Circom Groth16 circuits and hand-rolled Poseidon, Sealed
Pair on Sui with Walrus commitments and Seal threshold encryption, Samar on Ethereum with
Zama's fhEVM and branchless `FHE.select` settlement. In every one of those, the majority of
the work was cryptography fighting the chain's transparency, and every one added a trust
assumption or a performance ceiling. On Canton, "dealer B cannot see dealer A's quote" is a
`signatory`/`observer` declaration in the template. The privacy machinery column in my
README says "none" for Canton, and that is the whole thesis.

**Q2. What is real, and what is a demo?**
Real: the Daml model, the 36 test scripts, two DevNet deployments under the same package id
`4b1e408f…`, the on-network privacy verifier, 47 settled trades and 5 atomic baskets on the
5N validator, 16 best-execution attestations, the hosted read-only desk, and now Canton Coin
settlement through the DSO-run registry. Demo-only: nothing is faked, but the parties are
mine, the bonds are desk-issued, and the volumes are seeded, not customer flow. The
`MockRegistry` in the test suite is a test double for the *registry*, not for the standard —
it implements the real Splice `Holding` and `Allocation` interfaces from frozen DARs.

**Q3. How exactly does the reverse-Vickrey mechanism work?**
The buyer awards with a list of quote contract ids. The choice fetches each, asserts the
quote's `rfqId` matches this RFQ, and asserts one quote per dealer so nobody can stuff the
book. It sorts on `(price, dealer)` — the dealer is the tie-break so the winner is
deterministic regardless of the order the buyer listed them. The head of that sort is the
winner; the clearing price is the *second* entry's price, or the winner's own price if there
is only one quote. Every loser is exercised with `RejectQuote`, so it is archived without
ever having been transmitted anywhere. Then `SettleQuote` runs at the clearing price. It is
in `daml/Tirai.daml` under `Award`, and `AwardPartial` and `AwardWithAllocation` use the
identical selection logic.

**Q4. Why second price? Isn't the buyer just paying more than they had to?**
The buyer pays more than the best ask, but the asks themselves are better. Under a
first-price sealed auction a dealer shades its quote away from its true price to protect
margin. Under second price, quoting the true price is the dominant strategy, so the
distribution of asks improves. The buyer also has the direct-OTC rail — `SettleQuote` via
`ConvertToTokenTrade` — if it simply wants to lift one dealer at the ask. Both rails are
live and both are covered by tests.

**Q5. Who pays, and how much?**
A per-trade venue fee, in basis points of notional, taken in the settlement asset atomically
at settlement — the same economics as any OTC venue, except the contract collects it rather
than an invoice, so there is no collection risk. On top of that, CIP-0047 featured-app
activity markers accrue network rewards on every settlement, so a busy desk earns from the
volume it clears. I have not set the bps yet, deliberately: that number should come out of
the design-partner conversation, not out of my head. Zero revenue today.

**Q6. What is the regulatory posture? A private venue sounds like the opposite of what
regulators want.**
The regulator is a first-class party in the model, not an afterthought — it is one of the
four views in the product. It observes `TradeReport` and `BasketTradeReport` only: zero
pre-trade visibility, complete post-trade record. That is exactly the shape of existing
block-trading rules, which permit pre-trade opacity for large-in-scale orders precisely
because publishing them harms the end investor, and then demand full post-trade reporting.
Selective disclosure — `DiscloseTo` and `DealerDiscloseTo` — lets either side open a single
sealed quote to the regulator on demand, which is how the best-execution attestation is
built. A regulator gets more from Tirai than from a voice broker, not less.

**Q7. What breaks at scale?**
Three things, in order. First, escrow-on-quote is fully collateralised, so a dealer quoting
to ten clients at once must lock ten lots — real desks work on credit and netting, and that
is the honest capital-efficiency ceiling. Second, the Vickrey award passes an explicit list
of quote contract ids, which is fine for a dealer panel of five or ten and would need
rethinking for a hundred. Third, operational: today it is one package on two DevNet
participants, and a real panel means every dealer runs or rents a participant node, which is
an onboarding problem more than a technical one. None of these is a privacy problem — the
privacy model is per-transaction and does not degrade with volume.

**Q8. You are one person. Why can you execute this?**
Because the hard part is already behind me. This is the fifth implementation of the same
thesis, so the product design, the auction mechanics and the failure modes are not
hypotheses any more. The build journal in this repo shows the pace: repo created 22 July,
the whole CIP-0056 settlement leg landed on 23 July, hosted desk live 24 July, second
participant deployed and verified 26 July. What I cannot do alone is get an institutional
desk into a room, which is why my first ask is an introduction and not money.

**Q9. What are the honest gaps right now?**
No live cETH or CBTC transaction — waiting on the token grants, and the code path is
identical to the Canton Coin path that now works. No signed design partner. No paying
customer. DevNet only, no mainnet. The hosted desk cannot write, by design. Those five, in
that order.

**Q10. If the hosted desk is read-only, how do I know the write path works?**
Three ways. The demo video shows the desk driven end to end for real — RFQ, sealed quotes
with the rival column visibly empty, disclosure, Vickrey award, atomic settlement. The
47 settled trades on the validator were all written by that same write path. And the MCP
suite's `post_rfq` tool writes a real RFQ to DevNet on every run; the deployer's `tidy`
command clears it afterwards.

**Q11. Is the DSO registry integration genuinely external, or another mock?**
Genuinely external. The registry is DSO-run on the 5N DevNet validator — I do not administer
it and I cannot mint into it. My side calls its transfer factory and allocation factory over
HTTP, receives the choice context and the disclosed contracts, and forwards them to the JSON
Ledger API. `TokenTrade_Settle` then exercises `Allocation_ExecuteTransfer` on the
registry's own allocation contract. If the registry rejects, the whole transaction rolls
back and the dealer's collateral is returned. The interface DARs are the frozen Splice v1
bundle in `dars/`, never recompiled locally, precisely so my package ids match what live
registries implement against.

**Q12. What stops a dealer settling in a different, worthless asset?**
Instrument identity is bound end to end. The `TokenTrade` carries a `cashInstrument :
InstrumentId` — an administrator plus an id — and settlement asserts the allocation matches
it. A quote priced in cETH cannot settle in CBTC, and it cannot settle against an impostor
registry with the same id but a different administrator. `testWrongInstrumentRejected`
covers exactly that, and `testCbtcDvp` proves the same path works against a second,
differently-administered registry.

**Q13. What happens if the buyer never funds the allocation?**
Settlement is two-phase by design, because the registry's allocation needs the buyer's
wallet and the registry's off-ledger context. `TokenTrade` carries `allocateBefore` and
`settleBefore` deadlines. If the buyer walks away, `TokenTrade_Cancel` or `TokenTrade_Expire`
runs and the dealer's escrowed bond is returned. The wallet-facing `AllocationRequest_Reject`
does the same from the wallet side. The dealer is never left with locked collateral and no
counterparty.

**Q14. Why should a dealer join a panel where it cannot see its rivals' prices?**
Because it currently cannot see them either — a dealer terminal RFQ is already sealed. What
the dealer gains is that its own axe stops leaking: today, quoting on a transparent venue
tells competitors where it is positioned. And because the buyer's side is escrowed and the
award is a contract choice rather than a phone call, a dealer that wins actually settles.

**Q15. What is the 90-day validation plan?**
Days 0–30: land one design partner desk and the token grants; run live cETH and CBTC
settlements alongside the Canton Coin path already working; weekly sessions on the
quote-award-settle flow and the audit view. Days 30–60: instrument the desk against that
partner's real workflow, set the venue fee in bps from what they say they will actually pay,
and add whatever their compliance team needs from the regulator view. Days 60–90: a
supervised pilot at a hosting venue on a single instrument class, with the fee and the
featured-app markers switched on, and published execution-quality numbers with the desk's
permission. The three-stage version of this is already written in `SUBMISSION.md`.

**Q16. What did you actually build for HackCanton, versus what you inherited from Bisik?**
Disclosed up front in the README, the submission and the journal. From Bisik: the RFQ,
sealed-quote and escrow model. New for HackCanton: the entire CIP-0056 settlement leg —
`TokenTrade`, the `AllocationRequest` interface instance, `AwardWithAllocation`,
`ConvertToTokenTrade`, `TokenTrade_Settle`/`_Cancel`/`_Expire`; moving `Holding` and
`EscrowedHolding` onto the real Splice `HoldingV1` interface; deleting the fake in-package
token standard entirely; the second DevNet deployment on `hackcanton-01`; the hosted
read-only desk; and now the real Canton Coin settlement through the DSO registry.

---

## 5 · Pre-flight checklist — the 30 minutes before 14:00 UTC

### T-30 · Environment

- [ ] Close everything else. One browser window. Notifications off, phone silent.
- [ ] Laptop on mains power. Second network ready (phone hotspot, tested, not just paired).
- [ ] Screen resolution set so the three desk columns fit without horizontal scroll.
- [ ] Browser zoom at a level where a judge on a shared screen can read the quote prices.
- [ ] Water within reach. You will talk for five minutes without a break.

### T-25 · Tabs, left to right, in this order

Tab 1 is block 1. Tab 2 is block 2. Tabs 3, 4 and 7 are block 4. Block 3 needs no tab —
leave tab 2 or the audit view on screen and just talk.

1. https://tirai.vercel.app — landing page, scrolled to the top.
2. https://tirai.vercel.app/app — the desk, **already loaded and connected** (check the
   ledger status reads connected and the stats strip shows numbers, not dashes).
3. The desk again, second tab, pre-clicked to **Verify privacy**.
4. The desk again, third tab, pre-clicked to **Best execution**.
5. https://youtu.be/_iHMouFdNA4 — the demo video, paused at 1:43 (the empty rival column),
   as the fallback if the live desk fails.
6. https://github.com/PugarHuda/tirai — README open at the "Live on Devnet" table.
7. `daml/Tirai.daml` in an editor, scrolled to `TokenTrade_Settle`.

Pre-clicking tabs 3 and 4 matters: switching views live costs you five seconds of dead air
each time, and the tab switch is instant.

### T-15 · Warm the live state

- [ ] Reload the desk tab and confirm the stats strip shows a non-zero settled-trade count.
- [ ] Confirm the Verify privacy tab shows the **green** verdict. If it is amber or errored,
      reload once; if still bad, switch to the video fallback and say so plainly.
- [ ] Confirm Best execution lists the attestations.
- [ ] If you are showing the Canton Coin settlement from a terminal, have the command
      already typed but not run, and have its last successful output visible in scrollback
      as a fallback.
- [ ] Re-read the Canton Coin figures before you speak: six settlements, 60,900 CC. Any
      number not in this file or the repo does not get said live.

### T-5 · Rehearse the three sentences you must not fumble

Say these once, out loud:

1. "Dealer B's node never received it. On Canton that is a signatory and observer
   declaration."
2. "The cash leg now settles in real Canton Coin, through the DSO-run Canton Token Standard
   registry, on the 5N DevNet validator. An issuer I do not control."
3. "I need one design partner desk."

Then run a stopwatch through block 1 once. If it takes more than 55 seconds, you are
speaking too slowly for a four-minute slot — cut a sentence, do not speed up.

### Fallbacks

| If this fails | Do this |
|---|---|
| Hosted desk will not load | Switch to the demo video tab, paused at 1:43. Say: "the hosted desk is read-only over live DevNet state — here is the same view recorded." Keep going. Do not debug on camera. |
| Desk loads but shows stale or zero state | Speak over the README "Live on Devnet" table instead: two participants, same package id, 47 settled trades and 5 baskets on the validator. |
| Verify privacy shows an error | Say it plainly — "the live query is not responding right now" — and go to the video's 2:41–3:07 privacy verification chapter. Never claim green if it is not green. |
| Canton Coin settlement demo will not run live | Show the scrollback of the last successful run, and `TokenTrade_Settle` in `daml/Tirai.daml`. The code plus a prior successful run is credible; a failing live run is not. |
| Your internet drops entirely | Reconnect on the hotspot. If you cannot, the whole pitch is deliverable from the demo video plus the repo — say so and carry on. Do not apologise more than once. |
| A block starts to overrun | Jump to that block's last line and move on. Blocks 1–3 must not eat block 4. |
| You are cut off before block 4 | Say one sentence: "everything I described is live on Canton DevNet right now, and the desk is public at tirai.vercel.app." Then stop. |
| A judge interrupts mid-pitch | Answer, then say "let me show you the proof of that" and return to the script at the section you were on. Do not restart. |

### After the call

- [ ] Send the follow-up within the hour: repo link, hosted desk link, demo video link, and
      the one-line design-partner ask.
- [ ] Note every question you could not answer cleanly. Those are the gaps to close next.
