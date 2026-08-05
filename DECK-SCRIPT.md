# Reading script for the deck

Fifteen slides. **Four minutes of pitch, then two minutes of Q&A** — they are separate, so
do not save time for questions and do not run into them either. Written to be spoken, not
read off a page: short sentences, ordinary words. Say it the way you would explain it to one
person sitting next to you.

**Slide 14 is a twenty-second film and it narrates itself.** Stop talking, let it run, then
speak again on the close. That is the whole demo. The organisers asked everyone not to run a
live demo on stage, and this is why the demo is a video: nothing to break, nothing to wait for.

Two rules while you speak. Pause where the line breaks are, that is where you breathe. And
never rush a number, the numbers are the part they check afterwards.

Timings are a budget, not a stopwatch. If you fall behind, drop a whole slide rather than
speeding up. There is a two minute cut at the bottom for that.

578 spoken words plus a twenty-second film. Rehearsed pace lands it at 4:00, which
is the whole budget — there is no slack, so a sentence you add live is a sentence you drop
somewhere else. Rehearse it once with a timer, then trim whatever you keep stumbling on. The sentence
you stumble on twice is the sentence to cut.

**On the day.** Tech check opens 13:30 UTC; you are sixth on the running order, so join
early and be warm. The deck is a real deck: arrow keys or click, `f` for fullscreen, and it
remembers position in the URL. Have `tirai.vercel.app/deck` open in a second tab in case the
share dies.

---

## Slide 1 · Cover
**0:00 to 0:09**

> Hi, I'm Pugar. I built Tirai, and it's a confidential trading desk on Canton.
>
> Let me start with why anyone needs one.

*Advance immediately. Don't linger on your own name.*

---

## Slide 2 · Asking for a price is the information
**0:09 to 0:29**

> A bank wants to sell fifty million of bonds. First it has to ask dealers for a price.
>
> But the question is the information. The moment someone sees you asking they know your
> size and your direction, and the price moves away before you've traded.
>
> That's why block trading still happens on the phone.

*Ini pembukaan yang harus mendarat. Pelan, jangan buru-buru ke slide berikutnya.*

---

## Slide 3 · Privacy, or proof. Never both.
**0:29 to 0:46**

> Today you get two options and both are bad.
>
> A public venue leaks everything — your request is a transaction, so is every quote.
>
> A voice broker stays private, but you can't prove to compliance you got the best price.
>
> Privacy, or proof. Pick one.

*Tunjuk dua kartu itu saat menyebutnya. Jangan dibacakan isinya, mereka bisa baca sendiri.*

---

## Slide 4 · The dealer terminal, on the ledger
**0:46 to 1:06**

> Tirai gives you both.
>
> A buyer picks a panel of dealers. Each answers with a sealed quote, and answering locks
> their bond into escrow — a price is a commitment, not a bluff.
>
> The cheapest ask wins and is paid the second cheapest price, which makes quoting honestly
> the dealer's best move.

---

## Slide 5 · Dealer B's node never received dealer A's quote
**1:06 to 1:29**

> Here's the part I care about. Two sessions, one request, the same second.
>
> On the left, a dealer looking at its own ask. On the right, its rival: same row, empty
> where the price should be. That isn't the screen hiding it. That node was never sent the
> contract, so there's nothing to decrypt and nothing to leak.

*Slide ini hampir seluruhnya gambar. Tunjuk kolom PRICE di panel kanan saat menyebut "empty
where the price should be" — itu satu-satunya hal yang perlu mereka lihat. Jangan membaca
tulisan kecil di gambarnya.*

---

## Slide 6 · The chain did the hard part.
**1:29 to 1:43**

> To keep one number secret on another chain you need a trusted enclave, or zero knowledge
> circuits, or homomorphic encryption. Heavy machinery.
>
> On Canton it's a signatory and an observer declaration. About forty lines. That's the
> whole trick.

*Slide ini sengaja menyebut tekniknya, bukan proyeknya. Kalau ada yang bertanya apakah kamu
pernah membangun ini sebelumnya, jawab singkat dan jujur, lalu kembali ke poinnya: yang
menarik itu apa yang dihapus Canton, bukan berapa kali kamu mencoba.*

---

## Slide 7 · Desks whose tickets are big enough to leak
**1:43 to 1:55**

> Who buys it. Fixed income and crypto desks — banks, asset managers, prop shops — moving
> between one and a hundred million. And the venues that would host this as an embedded app.

---

## Slide 8 · A venue fee the settlement can collect
**1:55 to 2:15**

> A per trade venue fee, taken inside the settlement transaction. If the trade settles, the
> fee settled with it. Nothing to invoice, nothing to chase.
>
> That runs. One settlement on Devnet, twenty five basis points, ten thousand six hundred
> and twenty five to the venue. What I haven't set is the rate.

*Kalau ada yang menekan soal angka bps, jawab persis kalimat terakhir itu: mekanismenya jalan,
angkanya belum diputuskan. Kalau ditanya pendapatan, jawab nol — ini test asset di Devnet.*

---

## Slide 9 · Not a DEX. Not a chat room.
**2:15 to 2:23**

> A dark pool gives you both, if you completely trust the operator. Tirai doesn't ask you
> to trust an operator.

---

## Slide 10 · Not a mock-up
**2:23 to 2:40**

> This is all live. Two DevNet participants, the same package.
>
> Fifty settled trades. Five atomic baskets. Sixteen best execution attestations.
> Forty one Daml test scripts.
>
> One honest note. I generated that trading history myself. It shows the product works.
> It is not customers.

*Kalimat terakhir itu wajib. Justru itu yang membuat sisanya dipercaya.*

---

## Slide 11 · The claim is checked against the live ledger
**2:40 to 2:58**

> Two views do the proving.
>
> One counts what each party's node holds. Every dealer, only its own quotes. The regulator,
> nothing pre-trade.
>
> The other proves best execution with no order book: counterparties disclose their sealed
> asks, and the regulator checks the cleared price beat all of them.

---

## Slide 12 · Two assets. Neither of them mine.
**2:58 to 3:18**

> Your feedback asked for settlement in a real asset from a real issuer. Here it is, twice.
>
> Six trades in Canton Coin through the DSO's registry. Two in real CBTC through BitSafe's.
> I control neither.
>
> cETH is the same code path, one field. It goes live the day the tokens land.

*Ini jawaban langsung atas kritik juri. Ucapkan dengan tenang, jangan seperti menang argumen.*

---

## Slide 13 · One person. Five days.
**3:18 to 3:32**

> That's me. Pugar. Final year student, building this on my own.
>
> Repo created the twenty second of July, second participant verified by the twenty sixth.
> And a written ninety day validation plan, stop criteria set in advance.

---

## Slide 14 · Not a slideshow. The product.
**3:32 to 3:52** — *the film, not you*

> This is the desk being used. Watch dealer B's screen.

Then **stop talking**. Press play, let it run about twenty seconds — Dealer A seals its ask,
then Dealer B's session comes up with no price in it — and pause it there. The film narrates
itself, so talking over it makes both harder to follow.

*Kalau videonya tidak mau jalan, jangan panik dan jangan diperbaiki di panggung. Katakan:
"the recording is in the repo" lalu lanjut ke slide penutup. Kamu sudah menjelaskan hal yang
sama di slide lima; video ini bukti, bukan penjelasan.*

*Sebelum mulai: buka slide ini sekali saat tech check 13:30 UTC, klik play, pastikan suaranya
ikut ter-share. Screen share tanpa "share audio" akan memutar film ini tanpa suara.*

---

## Slide 15 · Close
**3:52 to 4:00**

> Tirai means curtain. Price discovery happens behind it.
>
> The desk is live at tirai dot vercel dot app. Thank you.

*Berhenti. Jangan menambah kalimat penutup lagi, biarkan senyap sebentar sebelum tanya jawab.
Tanya jawabnya dua menit dan terpisah dari empat menit ini, jadi tidak perlu menyisakan waktu.*

---

## If you fall behind

At **2:15** you should be starting slide 9. If you are not, skip slide 9 entirely — it says
what slide 3 already said. That buys seven seconds. The next thing to drop is slide 6.

Never cut slide 14. The film is the demo, and the organisers asked for a video instead of a
live one; arriving at the close without having shown the product is the one unrecoverable
mistake in this running order.

## If they cut you to two minutes

Say slides 2, 4, 5, 10, 12, 15. In that order, and play the film if there is any room at all.
Skip the rest without apologising for it.

The spine is: the question leaks, we seal it, the rival's node genuinely doesn't have it,
it's live, it settles in assets I don't issue, here's the link.

## Three things to avoid

You will be tempted to say "as you can see". Don't, just say what it is.

Don't read a slide out loud. They can read faster than you can speak, and it makes the
whole thing feel like a document.

If you lose your place, stop and look at the slide title. Every title is a full sentence
you can say out loud and continue from.
