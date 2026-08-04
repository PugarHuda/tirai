# Tirai — deck speaker notes

Grand Final, Wednesday 5 August 2026, 14:00 UTC. Four minutes, four prescribed
blocks of sixty seconds: **Problem · Solution & product · Market & business model
· Demo & team.**

The full spoken script lives in [`PITCH.md`](../PITCH.md) and has not been
rewritten here — this file maps that script onto the fourteen slides and gives
the clock. Where a slide's wording differs from `PITCH.md`, `PITCH.md` wins:
these slides are the backdrop, not the autocue.

**Deck controls.** Arrow keys, space, Page Up/Down move a whole slide; Home and
End jump to the ends. It is a scroll-snap document, so a trackpad works too and
it still navigates with JavaScript disabled.

---

## Running time budget

| # | Slide | Block | Starts | Length |
|---|---|---|---|---|
| 01 | Title — tirai. | 1 | 0:00 | 0:08 |
| 02 | Asking for a price *is* the information | 1 | 0:08 | 0:24 |
| 03 | Privacy, or proof. Never both. | 1 | 0:32 | 0:28 |
| 04 | The dealer terminal, on the ledger | 2 | 1:00 | 0:26 |
| 05 | Dealer B's node never received it | 2 | 1:26 | 0:18 |
| 06 | Fifth build. First one the chain did for me. | 2 | 1:44 | 0:16 |
| 07 | Desks whose tickets are big enough to leak | 3 | 2:00 | 0:22 |
| 08 | A venue fee the contract collects itself | 3 | 2:22 | 0:22 |
| 09 | Not a DEX. Not a chat room. | 3 | 2:44 | 0:16 |
| 10 | Not a mock-up | 4 | 3:00 | 0:14 |
| 11 | Checked against the live ledger | 4 | 3:14 | 0:16 |
| 12 | The cash leg is real Canton Coin | 4 | 3:30 | 0:18 |
| 13 | One person. Fifth implementation. | 4 | 3:48 | 0:06 |
| 14 | Price discovery happens behind it — the ask | 4 | 3:54 | 0:06 |

**The rule that matters:** blocks 1–3 must not eat block 4. If a block starts to
overrun, jump to its last slide's punch line and advance. Never skip slides 12
and 14 — slide 12 is the judges' first request answered, slide 14 is the ask.

---

## Block 1 · Problem — 0:00 to 1:00

### Slide 01 — Title (0:00, 8s)

Say your name and the one line. Nothing else. *"I am Pugar. Tirai is a
confidential dealer desk on Canton — you whisper quotes, the market hears
nothing."* Then advance; do not narrate the slide.

The first fifteen seconds carry more weight than the last sixty — eighteen teams
pitch today. Land the sentence, then move.

### Slide 02 — Asking for a price *is* the information (0:08, 24s)

The concrete case: a bank wants to sell fifty million of bonds, and before it can
trade it must ask dealers for a price. Then the turn — the question itself is the
information. The moment anyone sees you asking, they know your size and your
direction, and the price moves against you before you trade.

This is the spine of the whole pitch. Land it cleanly and pause on the full stop.
Do not add examples; the slide has the number on it.

### Slide 03 — Privacy, or proof. Never both. (0:32, 28s)

Both alternatives, in order, ten seconds each. On-chain: your request is a
transaction, the competing quotes are transactions, rivals simply read them.
Voice or chat: private, but no record — six months later you cannot prove to
compliance that you got the best price.

Close on the punch line: which is why block trading in 2026 still happens on the
telephone. That sentence hands you the next block.

*If block 1 is overrunning:* drop the second half of the on-chain card and go
straight to the telephone line.

---

## Block 2 · Solution and product — 1:00 to 2:00

### Slide 04 — The dealer terminal, on the ledger (1:00, 26s)

Tirai gives you both. Walk the five steps left to right, one clause each — RFQ to
a chosen panel, sealed quote, escrow on quote so a price is a commitment rather
than a bluff, cheapest ask wins and is paid the second-cheapest price, atomic
delivery-versus-payment.

Say "three rails" out loud — reverse-Vickrey, direct bilateral OTC, partial
fills on both — and that baskets settle atomically. Do not explain Vickrey here;
that is a Q&A answer (`PITCH.md` Q3 and Q4).

### Slide 05 — Dealer B's node never received it (1:26, 18s)

The strongest sentence in the product, so slow down: *"Dealer A cannot see dealer
B's quote. Not hidden by the interface. Dealer B's node never received it."*

Then the second card in one breath: the claim is falsifiable, and a verifier
recomputes each party's visible contract set on the real ledger and exits
non-zero if a quote ever leaks. Selective disclosure runs both ways — the buyer
can open a quote to the regulator, and a dealer can open its own to defend its
pricing.

### Slide 06 — Fifth build. First one the chain did for me. (1:44, 16s)

Do not read the table. Say: *"I have built this product four times before — TEEs,
Groth16 circuits, threshold encryption, fully homomorphic encryption. On Canton I
wrote none of it."* Let the eye do the rest, then land the last line: it is a
`signatory` and `observer` declaration. Privacy is the ledger model, not
cryptography bolted on.

That is the superpower sentence. Stop there and change block.

---

## Block 3 · Market and business model — 2:00 to 3:00

### Slide 07 — Desks whose tickets are big enough to leak (2:00, 22s)

Fixed-income and crypto-asset desks at banks, asset managers and prop shops, one
to a hundred million a ticket. Below a million leakage is a rounding error and a
public venue is fine; above it, leakage is the whole cost. Then the channel — the
venues that would host Tirai as an embedded app — and the regulator as the
mandatory third party that rules out a private chat.

### Slide 08 — A venue fee the contract collects itself (2:22, 22s)

Basis points of notional, in the settlement asset, collected atomically inside
the settlement transaction. If the trade settles, the fee is paid; no invoicing,
no collection risk. Plus CIP-0047 featured-app markers accruing network rewards
on every settlement.

**Two things not to do.** Do not state a bps number — it is deliberately unset,
and if pressed say it comes out of the design-partner conversation rather than
out of your head. Do not invent a market size; there is no TAM figure in this
repo. If a judge presses, give the shape: fee on notional, institutional ticket
sizes, sized with a design partner rather than guessed at.

The footer line on the slide — zero revenue today — is there so you can say it
before anyone asks.

### Slide 09 — Not a DEX. Not a chat room. (2:44, 16s)

The differentiation the judges asked for, in one pass down the table: each
alternative fails on exactly one axis. Public books fail on pre-trade
confidentiality; voice fails on provable settlement; the incumbent venues fail
because the venue itself sees everything; other Canton privacy demos have no
mechanism — they show Canton can keep a secret, they do not run a market.

Land on: private price discovery, with a receipt.

---

## Block 4 · Demo and team — 3:00 to 4:00

This is where the proof is. Never let an earlier block eat it.

### Slide 10 — Not a mock-up (3:00, 14s)

Two DevNet participants under one package id, including HackCanton's own node.
Forty-seven settled trades and five atomic baskets, sixteen attestations,
thirty-six Daml scripts green, hosted read-only desk over live state.

**Say the honest label out loud:** that history was generated by me — it shows the
product works, it is not customer traction. Volunteering that is stronger than
being caught by it, and the judges asked about validation.

*If you are showing the live desk instead of this slide, this is the moment.*

### Slide 11 — Checked against the live ledger (3:14, 16s)

*"This view is not a claim. It queries what each party's node actually holds,
right now. Each dealer sees only its own quotes. The regulator sees zero
contracts before settlement."*

Then best execution: no order book, yet sixteen attestations prove the buyer beat
every competing ask, built from quotes selectively disclosed to the regulator.

*If block 4 is running long,* cut the best-execution sentence — it comes back in
Q&A — but keep the privacy sentence.

### Slide 12 — The cash leg is real Canton Coin (3:30, 18s)

The first of the three judges' asks, answered directly: *"Your feedback asked for
real external settlement. The cash leg now settles in real Canton Coin, through
the DSO-run Canton Token Standard registry on the DevNet validator. An issuer I
do not control and cannot mint into."*

Then the mechanics in one sentence — the registry's transfer and allocation
factories are called over HTTP, and settlement is one atomic transaction: the
registry moves the cash, the desk delivers the bond, the regulator gets its
report. cETH and CBTC are the identical code path, waiting on a token grant
rather than on engineering.

**The number is confirmed:** six trades settled in real Canton Coin — four
reverse-Vickrey, two direct OTC, 60,900 CC moved to the winning dealers. Show it
rather than say it: the desk's **Portfolio** view has a *Registry assets* table
listing each party's Canton Coin balance and the issuer (`DSO`). Buyer 39,100,
Dealer A 45,350, Dealer B 15,550. One clause spoken, the table does the rest.

### Slide 13 — One person. Fifth implementation. (3:48, 6s)

Six seconds, two clauses: *"I am a solo builder, and this is the fifth
implementation of this thesis — repo created 22 July, the settlement leg landed
on 23 July, second participant verified on 26 July."* Speed argument, not an
apology.

If a judge probes the gaps, the right-hand card is the answer and there is a
written 90-day plan with the stop criteria set in advance — see
[`VALIDATION.md`](../VALIDATION.md). No design partner is signed; say that
plainly rather than describing warm conversations that have not happened.

*This is the first slide to cut if you are behind the clock.* Slide 14 is not.

### Slide 14 — The ask (3:54, 6s)

One sentence, then stop: *"I need one design-partner desk — one hour a week for
ninety days, not a purchase order. Tirai: you whisper quotes, the market hears
nothing."*

The three tags stay on screen through Q&A, in priority order: a design-partner
desk, the cETH and CBTC test-token grants, a hosting venue for a supervised
pilot.

---

## Before you go on

- Tabs and fallbacks: the pre-flight checklist in `PITCH.md` section 5. Pre-click
  **Verify privacy** and **Best execution** in their own tabs — switching views
  live costs five seconds of dead air each time.
- The Canton Coin figures are fixed: six settlements, 60,900 CC. Nothing else gets a number.
- Never claim the privacy verifier is green if it is not green on the day.
- Never present the seeded DevNet history as usage.
- If you are cut off before block 4: *"everything I described is live on Canton
  DevNet right now, and the desk is public at tirai.vercel.app."* Then stop.

## Rendering the PDF

```
node deck/render.mjs      # → deck/tirai-deck.pdf, 14 landscape pages
```
