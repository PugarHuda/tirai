# Tirai — the 4 minute demo

One deck, two wrappers: **Canton Builders Office Hours** (public, slot 0:22–0:32 —
~4 min presented, then 4 moderator questions) and **the accelerator call with Ty** (1:1).

The eleven slides are identical for both. Only the first 20 seconds and the last 25
change.

The screenshots in the deck were captured off the real desk running on a live Canton
node on 2 Sep, walking the same path Playwright had already verified end to end. They
are the product, not a mock-up.

---

## Before you go on

**You are presenting slides**, matching Samuel — the 5N sandbox validator rotated its
client keys and both of you lost access. That is one external event, not two project
failures, and it is worth saying plainly if it comes up.

The deck is **`deck/office-hours.html`** — 11 slides, arrow keys or click to advance,
`f` for full screen, and the URL hash keeps your place if you reload. Every screenshot
in it was captured from the real desk running on a live Canton node, not mocked up.

- **Fallback:** `deck/tirai-office-hours.pdf`, same 11 pages. If the browser deck
  misbehaves mid-session, open the PDF and keep going.
- Open the deck **before** you join, press `f`, and check slide 4 renders — that is the
  one that matters.
- Zoom is irrelevant for the deck (it scales to the viewport), but close everything with
  a notification badge. You are sharing a screen for ten minutes.
- Have `media/tirai-demo.mp4` open in a second window, paused. If someone asks to see it
  move, that is sixty narrated seconds of the real desk.

### The hosted link — deal with this before 13:00

Jason drops **tirai.vercel.app** in chat to the whole room. The landing page is fine.
The desk behind it cannot reach its validator, for the same key rotation. It now fails
with a route out — the film, the deck, and a clone — rather than a dead end, but do not
open it live.

**Message to send Jason before the session:**

> Hi Jason — confirming demo assets for my segment. Like Samuel, I'm presenting slides:
> the 5N sandbox validator rotated its client keys and I lost access too, so rather than
> point at a desk that can't read its ledger I've built the walkthrough from screenshots
> captured off the real thing. Eleven slides, about four minutes, leaving six for your
> questions.
>
> One heads-up on the links: `tirai.vercel.app/app` currently shows a "cannot reach its
> validator" notice for that same reason. The landing page, the deck and the repo are all
> fine — if you'd rather drop `tirai.vercel.app/deck` and `github.com/PugarHuda/tirai` as
> the primary links today, that works better for me.
>
> Also, a small correction you're welcome to use or ignore: your intro says "about forty
> lines of Daml". The privacy part is honestly two — the quote template declares
> `signatory dealer, buyer` and has no observer clause at all. Happy to make that point
> myself when you ask Q1.

---

## The spine · 4:00 · eleven slides

~470 words ≈ 3:10 at 150 wpm. The rest is the pauses. Slide 4 gets a real one.

### Slide 1 · cover · 0:00–0:20
> *"Thanks Jason. I'm going to skip straight to the thing a screenshot normally can't
> show you — a dealer's node **not** receiving something. These are screenshots off a
> live Canton node rather than a live desk, because the 5N sandbox validator rotated its
> client keys last week and, like Samuel, I lost access. Same event, not two problems."*

### Slide 2 · the problem · 0:20–0:45
> *"An institution wants to move a block of bonds. Before it can trade, it has to ask
> several dealers what they'd pay. And the moment anyone sees you asking, they know your
> size and your direction — so the price moves against you before you trade. Which is why
> block trading in 2026 still happens on the telephone."*

### Slide 3 · the mechanism · 0:45–1:10
> *"Four steps. The buyer invites a panel it chooses. Each dealer answers sealed, and
> quoting moves that dealer's bond into escrow — a price is a commitment, not a bluff.
> The cheapest ask wins and is paid the second-cheapest price. Bond and cash then move in
> one transaction: both legs, or neither."*

### Slide 4 · THE MONEY SHOT · 1:10–1:50
**Stop talking for three seconds after you land on this slide. Let them read it.**

> *"Two dealers, same auction, same moment. On the left, Dealer A has sealed four million
> two hundred and ten thousand. On the right is Dealer B's own session, reading Dealer B's
> own participant node."*
>
> *"Not a masked row. Not a commitment hash waiting to be revealed. Nothing. And that
> line in Dealer B's column is the product telling you why: rival dealers' quotes are
> never sent to your node."*

### Slide 5 · the two lines · 1:50–2:35
> *"Jason said about forty lines of Daml. Honestly, the part that does this is two. The
> quote template declares `signatory dealer, buyer`, and then it stops — there's no
> observer clause at all."*
>
> *"Look at the regulator. Its party id is written on that contract as a field, and the
> regulator still cannot see it — because being named in a contract isn't the same as
> being a stakeholder in it. On a transparent chain this costs you a TEE, a ZK circuit,
> or an FHE scheme. Here there's no third party to hide from, so there's nothing to
> encrypt. I've built this product four times on transparent chains; every time, the
> cryptography was most of the work."*

### Slide 6 · escrow, and the bug · 2:35–3:00
> *"Quoting locks the dealer's bond in escrow, so the buyer never awards into a bluff.
> And on the right — this is the worst bug I've shipped. With one quote there's no second
> price, and awarding used to fall back to the winner's own ask. First price wearing a
> Vickrey label, chosen after the buyer had seen every sealed number. The ledger refuses
> it outright now, and the regression test is named after the bug."*

### Slide 7 · the verifier · 3:00–3:20
> *"You shouldn't trust a demo about privacy. This view opens one read per party,
> addressed to that party's node, and counts what came back. Four reads, four parties,
> four different answers — checkable in your own devtools, from your side of the screen."*

### Slide 8 · best execution · 3:20–3:35
> *"A public exchange proves best execution against a visible order book. There's no book
> here, and it still proves it — from the sealed asks either side chose to reveal to the
> regulator. Confidential before the trade, auditable after it. Everyone says you have to
> pick one."*

### Slide 9 · the front-running answer · 3:35–3:50
> *"A judge asked me this at the grand final. An invited dealer does see the enquiry, and
> no ledger stops that. What changed is that every award now writes a record: who was
> invited, who answered, and how far each ask was from the winner's — in basis points,
> never the ask itself. A losing price stays unrevealed even in the buyer's own record."*

### Slides 10–11 · status, then hand back · 3:50–4:00
> *"Fifty settled trades on Devnet, cash legs in real Canton Coin and BitSafe's CBTC
> through registries I don't control, shipped as a package upgrade rather than a redeploy.
> What I won't claim: no design partner, no revenue, and the fee doesn't work on a
> registry rail. Jason, over to you."*

**Do not deliver the ask here.** It has its own slot at 0:58, and slide 11 is there for it.

---

## If it breaks

| What happens | Do this |
|---|---|
| Browser deck misbehaves | `deck/tirai-office-hours.pdf`, same eleven pages. Keep talking while you open it. |
| Someone asks to see it move | `media/tirai-demo.mp4` — sixty narrated seconds of the real desk. Second window, already paused. |
| Someone asks to see it live | "The 5N sandbox rotated its client keys last week — same thing that hit Umbra. `npm run demo` from the repo boots a Canton sandbox and serves this desk on your own machine in about two minutes, and that's the version I'd rather you judge it on anyway." |
| Someone asks about the hosted desk | Do not open it. Same answer as above. |
| You're at 3:30 and on slide 6 | Skip 7 and 8, go straight to 9 and 10. The front-running answer and the honest-gaps slide both survive; the verifier gets covered again in moderator Q4 anyway. |

## Wrapper A — Canton Builders Office Hours

**0:00 – 0:20 opening.** Jason has just read a long intro. Do not repeat it. (This is
slide 1; the line is already in the spine above.)

> Thanks Jason. I'm going to skip straight to the thing a screenshot can't show you,
> which is a dealer's node *not* receiving something. This is a live participant node
> on my machine — I'd have pointed at the hosted DevNet desk, but its service
> credentials expired last week and I'd rather show you something real than something
> cached.

**3:50 – 4:00 close.** Hand back cleanly — the moderator has four questions ready and
your ask has its own slot at 0:58. Don't spend it here.

> That's the mechanism. Fifty settled trades on DevNet behind it, cash legs in real
> Canton Coin and in BitSafe's CBTC through registries I don't control, and it shipped
> as a package upgrade rather than a redeploy — the validator is running version 0.1
> through 0.5 side by side. Jason, over to you.

**The 30-second ask (slot 0:58 — write this on a sticky note):**

> One introduction: a desk, a dealer, or a fund administrator that runs block enquiries
> over chat today, and will put ten of them through this and tell me where it breaks.
> Not a contract — ten enquiries. I've written down in advance the point at which I
> stop: if they go quiet for two weeks, or if the privacy verifier ever shows a quote
> visible to a rival, the pilot ends there.
>
> And second: if you're building on the Canton Token Standard, I'm a second
> implementation you can test your registry against. I've already found two DX
> problems in other people's registries by being that. hudapugar@gmail.com.

---

## Wrapper B — the accelerator call with Ty

**Opening (0:00 – 0:20).** He has read the application. Skip the origin story.

> Rather than talk about it — four minutes of slides, and then I want to ask you about
> three things I'm stuck on.

**On a 1:1 call you can afford the live version instead** — `npm run demo` boots in two
minutes and there is no room to lose if it stumbles. `DEMO-4MIN-ID.md` still carries the
click path if you want it. Your call on the day.

**Close (3:35 – 4:00).** Then move to the asks — this is the actual point of the call.

> Third place out of eighteen at HackCanton, fifty settled trades, forty-four Daml
> test scripts, two live trades in BitSafe's CBTC with an external issuer. What it does
> not have is a single customer, and that's what I want to use you for.

Then, in order — the ask that matters first:

1. **One warm intro to a design partner.** Named targets are already written up in
   `VALIDATION.md`: onRails, BitSafe, ccview, and validator operators like Noders and
   5N who know which of their tenants actually trade rather than hold.
2. **DevNet credentials.** The 5N M2M client credentials expired; the hosted desk has
   been reading an empty book since 27 Aug. Small ask, someone with a validator
   relationship closes it in a day.
3. **The cETH token grant**, stuck with onRails. One intro finishes the rail story.
4. **Money, asked plainly.** He already probed how you sustain yourself — he asked for
   a reason. The gap between ten hours a week and thirty is the gap between a pilot
   that runs and one that doesn't. Ask what support looks like: stipend, grant, or none.
5. **A second person**, or cofounder matching. Your ninety-day plan needs discovery
   calls you cannot run while shipping.
6. **An entity to invoice from.** The venue fee is built and tested; revenue is zero.

And ask *them* two things: **how much equity, and what does graduating mean.** A vague
answer is itself the data.

---

## If you drive it live instead (the Ty call, or anyone who asks for it)

`npm run demo` boots a Canton sandbox and serves the desk in about two minutes, with no
credentials of any kind. The click path is in `DEMO-4MIN-ID.md`. Four things that will
bite you, all found the hard way:

- **Disclose to the regulator BEFORE you award.** The award archives the quotes and takes
  the disclose controls with them — zero survive it. Award first and the best-execution
  view reads "No competing asks disclosed" for that trade, permanently.
- **Rehearsing eats the ledger.** The seed gives each dealer `TBOND30 ×1000` and
  `GILT10 ×100` — exactly two auctions per boot. Restart after every rehearsal.
- **Best execution attests only when an instrument has exactly one settlement.** Settle
  `TBOND30` twice and the card turns into "ambiguous".
- **Dealer panel is buyer-only**, and there is no "Desk fee" field locally — the sandbox
  seed allocates no venue party.

## The four moderator questions — answer them properly, they published them

**Q1 · "Forty lines of Daml vs TEE/ZK/FHE — why does signatory-and-observer handle
this natively?"**

> Because on a transparent chain, privacy is something you add *on top of* a ledger
> that has already broadcast everything. You encrypt, or you prove in zero knowledge,
> or you compute inside hardware you have to trust. All three are machinery for hiding
> data from people who already received it.
>
> Canton never sends it. A contract goes to its stakeholders and to nobody else, and
> stakeholders are declared in the template. My quote template declares `dealer, buyer`
> and stops. There is no third party to hide from, so there is nothing to encrypt. The
> honest version of the forty-lines line is that the privacy isn't forty lines of work
> — it's the absence of a line. What the forty lines actually buy is the *mechanism*:
> escrow, the second price, the disclosure path.

**Q2 · "Why lock collateral into escrow on quote — why a commitment rather than a
price indication?"**

> Because an indication is free, and anything free gets abused in a sealed auction.
> If quoting costs nothing, the winning move is to quote aggressively everywhere and
> decide later whether to honour it — which is exactly the behaviour that makes desks
> distrust electronic RFQ and go back to the phone.
>
> Submitting a quote here moves the dealer's bond into escrow. The price is backed by
> the asset before the buyer ever sees it. So the buyer is never awarding into a bluff,
> and the dealer is never left holding a counterparty who changed their mind. It also
> makes quote-spam self-limiting: your inventory is finite, so the number of live
> quotes you can carry is finite.

**Q3 · "Why second-price rather than settling at the winner's own ask?"**

> Because at first price, your best strategy is never to quote your real level — you
> shade it, and how much you shade depends on guessing the other dealers. That guessing
> is where the information games live.
>
> At second price the winner is paid the runner-up's number, so shading costs you deals
> without ever improving your margin. Quoting your true level becomes the profitable
> strategy rather than the naive one. And it composes with the sealing: rivals are
> blind, so you cannot infer the field, and second price means you don't need to.
>
> I'll add the thing I got wrong, because it's the sharpest edge here. Awarding a
> one-quote auction used to fall back to the winner's own ask — first price wearing a
> Vickrey label, chosen after the buyer had seen every sealed number. That's now
> rejected outright, with a regression test named after it. A buyer who wants to take
> a single ask uses the direct path, where it is called what it is.

**Q4 · "How do you use the privacy verifier on institutions who don't believe the
privacy claim?"**

> I don't ask them to believe it, and I don't demo it *to* them — I get them to run it.
> The verifier issues one read per party, addressed to that party's node, and counts
> what comes back by template. A skeptic can watch the four requests in their own
> devtools and see four different parties getting four different answers.
>
> But the real answer is that a hosted page is the weakest possible evidence, because
> I control the server. So the artifact is the repo: `npm run demo` boots a Canton
> sandbox, seeds it, and serves the desk in about two minutes on their machine, and
> `scripts/devnet.mjs verify` asserts the same properties against the live network. The
> pitch to a skeptical desk is not "look at my screen", it's "you have a validator —
> allocate one party, vet one DAR, and check it yourself."

**Backup Q&A · "How do you prove what a node holds without revealing contents?"**

> To be precise, I don't prove the contents — I prove *absence*, which is the claim
> that matters. Each read is an active-contract query submitted as one party, and what
> comes back is that party's own view. The rival's view is empty, and it is empty at
> the source, not filtered on the way out.
>
> The limitation I'd want stated: those reads go through my node's API, so this is
> convincing to someone reading the network tab and not to a formal verifier. If you
> want it stronger, you run the participant. That's the whole design — the proof lives
> on the counterparty's infrastructure, not mine.

---

## Group discussion — one line each, don't ramble

- **Q1 privacy as economics** — "It isn't a compliance wrapper on the product, it *is*
  the product. Remove blindness and the second-price auction stops working, because
  everyone can see the field. The privacy and the pricing mechanism are one thing."
- **Q2 what breaks if globally visible** — "The mechanism, immediately. I'd have to
  rebuild sealed quoting as commit-reveal, and commit-reveal leaks timing and lets a
  dealer simply not reveal. Every version of that fix is worse than the thing it
  replaces. I've built this product four times on transparent chains; the cryptography
  was always most of the work."
- **Q3 composing with what you don't control** — "Three scars. Registry choice contexts
  are round-scoped, so a retry has to refetch, never replay — a replay comes back as
  `UNKNOWN_CONTRACT_SYNCHRONIZERS` and reads exactly like your own bug. A transfer to a
  receiver with no pre-approval is two phases, not one. And my venue fee cannot be
  taken on a registry rail at all, because those settle by issuer allocation rather
  than by splitting a holding I hold — I'd rather say that out loud than have someone
  find it."
- **Q4 hackathon → production** — "A design partner, honestly. The code is further
  along than the evidence. After that: a custody story that isn't my key, and the fee
  working on registry rails."
- **Q5 what didn't survive the ledger** — "Two. I assumed I could reconstruct dealer
  behaviour from ledger history — `/v2/updates/flats` gave me a live pipe and zero
  historical events across six request shapes, so I stopped needing history and made
  the award *write* the record instead. And I assumed an ACS wildcard read would just
  work; the node caps it at 200 elements, my buyer went past it, and a whole column of
  the hosted desk went dark. Neither is in any tutorial."
- **Q6 what's missing in the ecosystem** — "Read-side developer experience. Historical
  event replay that actually returns events, an ACS read that pages instead of
  refusing at 200, and a shared client library for the Token Standard's allocation
  flow — I hand-rolled the two-phase transfer and the choice-context refetch, and so
  has everyone else in this call. That's a library somebody should just write."

## Don't sound like Umbra's echo — Samuel goes on right before you

Same thesis, adjacent products, and he took Silver. Be generous about it and be
precise about the difference; the room will notice if you aren't.

> "Samuel and I attacked the same leak from different ends. Umbra makes the *venue*
> blind. Tirai makes the *price* provable — the second-price mechanism, the
> best-execution attestation, and a panel record that scores how dealers behaved. His
> question is who can see the quote. Mine is whether the number was fair, and whether
> you can show a regulator that it was without ever revealing a losing price."

If asked directly whether you overlap: say yes, plainly, and say the ecosystem needs
more than one implementation of confidential RFQ — then point out that you have each
been a free integration test for the other's registry assumptions. That answer makes
you both look better than a turf claim would.
