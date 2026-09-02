# Canton Builders Office Hours — everything Pugar has to do

Your slot is **0:22–0:32**. You also speak in the group discussion (0:42–0:55), the
open Q&A (0:55–0:58), and you get **30 seconds at 0:58** for one ask.

The demo script and every prepared answer live in **`DEMO-4MIN.md`**. This file is the
checklist and the copy-paste text.

---

## NOW — three messages to send before the session

### 1 · To Jason — closes the `[Pugar to confirm demo assets]` open item

The run of show has that bracket sitting against your name. Close it, and warn him
about the link in the same message so it isn't a surprise on air.

> Hi Jason — confirming demo assets for my segment.
>
> **Screen share:** a live Canton participant node running on my machine, driving the
> desk end to end — buyer opens an RFQ to two dealers, each seals a quote, and you
> watch the second dealer's column stay empty while the first one's quote exists.
> Then the privacy verifier, which opens a separate read against each party's node and
> counts what came back. About four minutes, leaving six for your questions.
>
> **One heads-up on the links.** The hosted desk reads Devnet through service
> credentials that expired last week, and I don't have the replacement yet — so
> `tirai.vercel.app/app` currently shows a "cannot reach its validator" notice instead
> of the book. The landing page, the deck and the repo are all fine. My demo is a
> local node so the session itself is unaffected; I just didn't want anyone clicking
> through cold. If you'd rather drop `tirai.vercel.app/deck` and
> `github.com/PugarHuda/tirai` as the primary links today, that works better for me.
>
> Also, a small correction you're welcome to use or ignore: your intro says "about
> forty lines of Daml". The privacy part is honestly two — the quote template declares
> `signatory dealer, buyer` and has no observer clause at all. Happy to make that
> point myself when you ask Q1.

### 2 · To Samuel (Umbra) — before you're both on air

He presents right before you with an adjacent product and he outranks you on the
scoreboard. A message beforehand turns a comparison into a double act.

> Samuel — congrats on the Silvers, and on the BYOW trade; seven signatures with no
> key held is the part of your build I'd have found hardest.
>
> We're on back to back with overlapping products, so rather than repeat each other:
> I'm going to frame Umbra as making the *venue* blind and Tirai as making the *price*
> provable — second-price mechanism, best-execution attestation from disclosed asks.
> Shout if you'd rather I frame it differently. And if you've hit the Token Standard
> registry quirks I have — round-scoped choice contexts, the two-phase transfer when
> the receiver has no pre-approval — I'd like to compare notes after; we're probably
> each other's only second implementation.

### 3 · To Ales (NODERS) — a warm line into the thing you actually need

He is the HackCanton lead and a validator operator. He knows which of NODERS' tenants
*trade* rather than hold. That is your design-partner shortlist, and he is on the call.

> Ales — thanks for HackCanton, and for co-hosting today.
>
> One thing I'll ask the room for at the end is a design partner: a desk or dealer that
> runs block enquiries over chat today and will put ten through Tirai and tell me where
> it breaks. You see who is actually transacting on Canton rather than just holding —
> if one or two names come to mind while I'm talking, I'd rather hear them from you
> than guess. Also, separately: my hosted desk's 5N Devnet service credentials expired
> and I'm trying to get them reissued. If you know who to ask, that's a small favour
> with a disproportionate effect.

---

## T-30 — boot, and don't touch it

```powershell
# Kill anything squatting on the ports first. A shadowed 8080 answers with someone
# else's 404 and looks exactly like your bug.
Get-NetTCPConnection -LocalPort 8080,6865,7575 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
cd "C:\Hackathons\Hackathon Build on Canton\tirai"
npm run demo        # 1-2 min. "Party already exists" on first try = just run it again.
```

- Open `http://localhost:8080/app`. **One tab.** Zoom **125%**.
- Warm the paint: click **Side-by-side proof**, then back to **Active RFQs**.
- Open `media\tirai-demo.mp4` in a second window, **paused at 0:00**. That is your
  parachute if the sandbox dies mid-segment.
- Quit Slack, Discord DMs, mail. You are sharing a full screen for four minutes.

> **If you rehearse, restart afterwards.** The seed gives each dealer `TBOND30 ×1000`
> and `GILT10 ×100` — exactly two auctions per boot. A rehearsal spends one. A dealer
> with no lot left cannot quote, live, in front of the room.

---

## During the session

### 0:00–0:22 — you are not speaking. Do these things.

- Have `DEMO-4MIN.md` open on your second screen, scrolled to the spine.
- **Listen to Samuel's segment properly.** He answers four questions you are about to
  be asked variants of. If he says something you agree with, say so in the group
  discussion by name — it reads as generosity and costs you nothing.
- Post your own links in chat *after* Jason's intro, not before:

> Tirai — confidential multi-dealer RFQ desk on Canton.
> Deck: https://tirai.vercel.app/deck · Code: https://github.com/PugarHuda/tirai
> Landing: https://tirai.vercel.app
> (Heads-up: the hosted desk itself is showing a "cannot reach validator" notice today —
> its Devnet service credentials expired and I'm getting them reissued. The demo you're
> about to see is a live participant node. `npm run demo` from the repo gives you the
> same desk on your own machine in two minutes.)

### 0:22–0:32 — your segment

Four minutes of demo from the spine in `DEMO-4MIN.md`, then Jason's four questions —
all four are drafted there in full. The three that matter most:

- **Q1 (forty lines)** — correct it downward to two, and explain *why* absence beats
  encryption. This is your best moment in the hour; don't hurry it.
- **Q3 (second price)** — end by volunteering the single-quote Vickrey bug you found
  and fixed. Naming your own worst bug on a public call is worth more than any claim
  you could make instead.
- **Q4 (privacy verifier)** — the answer is "I don't ask them to believe it, I get them
  to run it", and it ends on `npm run demo`. That is also your CTA, so land it cleanly.

### 0:42–0:55 — group discussion

One line each, all six drafted in `DEMO-4MIN.md`. Your two strongest are **Q5** (the
`/v2/updates/flats` dead end and the 200-element ACS cap) and **Q6** (the read-side DX
gaps a builder could go and fix). Both are specific, both are things nobody else in the
room can say, and Q6 is the answer Ales explicitly said he wants to hear.

Don't dominate. Three of the six questions with a good answer beats six with a thin one.

### 0:58 — the 30 seconds. Read this off a sticky note.

> One introduction: a desk, a dealer, or a fund administrator that runs block enquiries
> over chat today, and will put ten of them through this and tell me where it breaks.
> Not a contract — ten enquiries. I've written down in advance the point where I stop:
> if they go quiet for two weeks, or if the privacy verifier ever shows a quote visible
> to a rival, the pilot ends there.
>
> And second — if you're building on the Canton Token Standard, I'm a second
> implementation you can test your registry against. Being that has already found two
> DX problems in other people's registries. hudapugar@gmail.com.

---

## After — within two hours, while you are still a name people remember

1. Post in `#builders-chat` on the post-event thread. Not a thank-you — an artifact:

> Thanks all. The bit I demoed is two lines of Daml, so here they are rather than making
> anyone take my word for it:
>
> `template Quote … signatory dealer, buyer` — and no observer clause. The regulator's
> party id is a *field* on that contract and the regulator still cannot see it, because
> being named in a contract isn't the same as being a stakeholder in it. The regulator
> only becomes an observer on `TradeReport`, after execution.
>
> `npm run demo` from https://github.com/PugarHuda/tirai boots a Canton sandbox, seeds
> it and serves the desk in about two minutes if you want to break it yourself.
> Still looking for one design partner running block enquiries today.

2. **DM anyone who reacted or asked a question in chat, individually, the same day.**
   That is where the design partner actually comes from — not from the 30-second ask.
3. Write down every question you could not answer well. Those are the next commits.

---

## Numbers Jason will read — all verified 2 Sep

| Claim | Status |
|---|---|
| 3rd place, HackCanton S2 Grand Final | correct |
| 50 settled trades on Devnet | matches deck, landing, README |
| 16 best-execution attestations | matches |
| 44 Daml test scripts | matches deck, landing, README, SUBMISSION, VALIDATION |
| cash legs in real Canton Coin and CBTC | correct — 6 CC trades, 2 CBTC |
| venue fee taken inside settlement | correct, **but not collectable on registry rails** — say so if pressed |
| shipped as package upgrade, not redeploy | correct — validator runs 0.1.0 through 0.5.0 side by side |
| "about forty lines of Daml" | loose. The real number is two lines. Correct it upward in value, downward in count. |

Public surfaces checked today: landing 200, deck 200, repo 200, `/media/tirai-demo.mp4`
serves. Only `/app` is degraded, and it now fails with a route out rather than a dead end.
