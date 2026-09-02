# Tirai — the 4 minute demo

One spine, two wrappers: **Canton Builders Office Hours** (public, slot 0:22–0:32 —
~4 min demo then 4 moderator questions) and **the accelerator call with Ty** (1:1).

The clicks are identical. Only the first 20 seconds and the last 25 seconds change.

Every beat below was walked against a live sandbox on 2 Sep with Playwright — 12/14
first pass, 5/5 after the disclose-order fix. It is a driving script, not a speech.

Narration: ~470 words ≈ 3:10 at 150 wpm. The remaining ~50 seconds is typing and
ledger round-trips. That silence is correct. Do not fill it.

---

## Before you go on

```powershell
Get-NetTCPConnection -LocalPort 8080,6865,7575 -ErrorAction SilentlyContinue |
  Select-Object LocalPort, OwningProcess        # kill anything that answers
cd "C:\Hackathons\Hackathon Build on Canton\tirai"
npm run demo                                     # 1-2 min. "Party already exists" = just rerun.
```

- **Restart after every rehearsal.** `holdingsOnly` gives each dealer `TBOND30 ×1000`
  and `GILT10 ×100` — exactly **two** auctions per boot. Rehearse and you have spent
  them; a dealer with no lot left cannot quote, live, in front of everyone.
- `http://localhost:8080/app`, **one tab**, browser zoom **125%**.
- Warm the first paint: click **Side-by-side proof** once, then back to **Active RFQs**.
- Close Slack, Discord DMs, and anything with a notification badge. You are sharing
  a full screen for four minutes.

### The hosted-desk problem — deal with this before 13:00

Jason's script says "live on DevNet" and drops **tirai.vercel.app** in chat to the
whole room. The landing page is fine (its numbers are hardcoded, and it is honest
that the history was seeded by you). But it links straight to the desk, and the
desk's DevNet credentials expired around 27 Aug: `/app` cannot reach the validator.

It already fails honestly — *"This desk cannot reach its validator right now… nothing
is wrong with the model or the code — clone the repo and run `npm run demo`."* That
is survivable, but not if it surprises you on air.

**Message to send Jason before the session:**

> Quick heads-up for the links: the hosted desk's DevNet service credentials expired
> last week and I haven't got the replacement yet, so tirai.vercel.app/app currently
> shows a "cannot reach its validator" notice instead of the book. The landing page
> and the deck are fine. My demo is a live participant node on my own machine, so the
> session itself is unaffected — I just didn't want anyone clicking through cold.

**If it comes up live:** *"The hosted deployment is read-only against DevNet and its
service credentials expired last week — that's a key rotation, not a ledger problem.
What you're watching here is a live participant node."* Do not open it.

---

## The spine · 4:00

### 0:00 – 0:20 · frame
*(wrapper-specific — see below)*

### 0:20 – 0:50 · Open the auction, live
*Click **Create RFQ** → **Auction** → Instrument `TBOND30`, Quantity `1000` →
**Open the auction**. Then **Side-by-side proof** in the sidebar.*

> A buyer wants a thirty-year treasury, a thousand units. Two dealers are invited.
> The market never sees that this exists — not the instrument, not the size.
>
> Three columns, three participant nodes: the buyer, and the two dealers. Not three
> apps. One ledger, seen from three places.

### 0:50 – 1:50 · The money shot, and the two lines behind it
*Dealer A column → **Quote** → `4210000` → submit.*

> Dealer A answers with a sealed quote. Four million two hundred and ten thousand.

*Pause. Point at Dealer B's column. Hold it — three full seconds.*

> Now Dealer B. Not a masked row. Not a commitment hash waiting to be revealed.
> **Nothing.** That quote was never transmitted to Dealer B's node.
>
> Jason said forty lines of Daml. Honestly, the part that does this is two. The quote
> template says `signatory dealer, buyer`, and then it says nothing else — there is no
> observer clause. The regulator's party id is *written on that contract as a field*,
> and the regulator still cannot see it, because being named in a contract is not the
> same as being a stakeholder in it. On a transparent chain this beat costs you a TEE,
> a ZK circuit, or an FHE scheme. Here it costs you a line you didn't write.

*Dealer B column → **Quote** → `4250000` → submit.*

> Dealer B prices blind. Neither dealer has ever seen the other's number.

### 1:50 – 2:05 · Selective disclosure — **before the award, never after**
*Buyer column: on each of the two sealed quote cards click
**⚖ Disclose to regulator**. Two clicks, ~2s apart.*

> Before I award — either side can reveal one sealed quote to a regulator, on demand,
> without showing it to a rival and without publishing anything.

> ⚠ **Order is not optional.** The award archives the quotes and takes the disclose
> buttons with them. Award first and the best-execution beat at 3:10 is dead: the card
> reads *"No competing asks disclosed"* and there is no way back on stage. Verified —
> zero disclose controls survive an award.

### 2:05 – 2:30 · Award — second price, atomic
*Buyer column → **Award**. Wait for the `landed` banner.*

> The cheapest ask wins — Dealer A — and is paid the **second** price. Four million
> two hundred and fifty. Bond and cash move in one transaction: both legs or neither.

### 2:30 – 3:10 · The privacy verifier
*Sidebar → **Verify privacy**.*

> You should not trust a demo about privacy, so this doesn't ask you to. This view
> opens a separate read against each party's node, as that party, and counts what came
> back. Each dealer's node holds its own quote and nothing else. The regulator held
> zero contracts until the trade executed.
>
> If you have devtools open you can watch it: four reads, four different parties, four
> different answers. That is the whole claim, and it is checkable from your side of the
> screen, not mine.

### 3:10 – 3:35 · Best execution without a public book
*Sidebar → **Best execution**.*

> A public exchange proves best execution against a visible order book. There is no
> book here. It still proves it, from the two asks disclosed a minute ago: the winner
> quoted the lowest, and the buyer paid no worse than anyone. Confidential before the
> trade, auditable after it — and everyone says you have to pick one.

### 3:35 – 4:00 · close
*(wrapper-specific)*

---

## Wrapper A — Canton Builders Office Hours

**0:00 – 0:20 opening.** Jason has just read a long intro. Do not repeat it.

> Thanks Jason. I'm going to skip straight to the thing a screenshot can't show you,
> which is a dealer's node *not* receiving something. This is a live participant node
> on my machine — I'd have pointed at the hosted DevNet desk, but its service
> credentials expired last week and I'd rather show you something real than something
> cached.

**3:35 – 4:00 close.** Hand back cleanly — the moderator has four questions ready and
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

> Rather than talk about it — four minutes, and then I want to ask you about three
> things I'm stuck on. This is a live Canton node, and I'm going to run a real auction.

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

## If it breaks, and traps baked into this build

| What happens | Do this |
|---|---|
| A click does nothing | Per-button guard, not a hang. Click once more. **Never double-click** — a genuine collision is rejected by the ledger with a message on screen, which is worse than a pause. |
| Sandbox dies / page won't load | Don't debug live. `media/tirai-demo.mp4` is a 60-second narrated cut of this exact flow. Third tab, paused, ready. Play it and keep talking. |
| Ledger seems stuck | The desk polls every 1.8s. Count to four before you say anything. |
| You're at 3:00 and not at the verifier | Skip best execution — the moderator's Q4 is about the verifier, so that is the one that must survive. |

- **Disclose before award, always.** The controls do not survive the award.
- **Best execution attests only when an instrument has exactly one settlement.**
  Settle `TBOND30` twice and the card turns into "ambiguous" and the beat dies.
- **No "Desk fee" field in the local demo** — the form only renders it when a `venue`
  party exists in server config, and the sandbox seed allocates none. The fee is
  spoken about, never pointed at. Don't go looking for the input on stage.
- **Dealer panel is buyer-only.** Switching identity to a dealer hides the nav item.
- **Landing page is safe to show. Hosted `/app` is not.**

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
