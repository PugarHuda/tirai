# Tirai: judge-question map for the deck (EN / ID)

HackCanton Season #2 Grand Final · Wednesday 5 August 2026, 14:00 UTC · 4 minutes plus
judges' questions. Builder: Pugar Huda Mantoro (team **Diam**), solo.

This is a different cut from [`PITCH-QA.md`](PITCH-QA.md). That pack rehearses answers.
This one sorts questions by **whether the deck answers them or not**, and gives you the
move for each case.

- **Part A. 20 questions the deck already answers.** The move is *"the answer is on
  screen"*. Turn to the slide, point at the named element, say one sentence, stop.
- **Part B. 20 questions the deck does not answer.** The move is a spoken answer that
  stands alone. No slide will help you. These are the ones that decide the room.

Nothing here repeats a question from `PITCH-QA.md`. Anything not checkable in this
repository is marked `[assumption]` / `[asumsi]`.

---

## Before Wednesday: three things to fix or know

1. **The settled-trade count does not agree with itself.** Slide 10's stat tile reads
   **41**. `README.md` and `SUBMISSION.md` say **47** on the shared 5N validator.
   `PITCH.md` Q2 says **49**. `scripts/make-pdf.mjs` also says 41. Pick one number, read
   it off the validator, and change all four before you present. Until then, do not say a
   settled-trade number out loud that differs from the tile a judge is reading. Part B1 is
   the answer if you are caught.
2. **"Shell 23/23" is not in this repo.** `README.md` records `npm run e2e:shell` at
   **14 / 14**, and the read-only proxy self-test separately at 14 / 14. The other suite
   numbers check out: 44 Daml scripts, e2e 28/28, actions 23/23, best-exec 8/8, hosted
   87/87 across three browsers, MCP 25/25.
3. **Slide 10 undersells what is verified.** The tile says 44 Daml scripts; the full
   suite table in `README.md` is stronger. Keep it in your pocket for Part B10.

**Also on screen but not given its own entry below:** the three execution rails and atomic
baskets (slide 04, the paragraph under the flow strip), losing quotes archived unrevealed
(slide 04, footer), the regulator's zero pre-trade view (slide 05, left card), the dated
build timeline (slide 13, left card). Twenty entries in Part A were selected from a larger
honestly covered set; nothing below is padding.

---

# Part A. The deck answers it

Turn to the slide. Point. One sentence. Then stop talking.

---

## A1. Why can a bank not simply ask three dealers for a price?
**ID —** Kenapa sebuah bank tidak bisa sekadar menanyakan harga ke tiga dealer?
**Slide —** 02 · Asking for a price *is* the information
**Point —** the punch line: *"The moment anyone sees you asking, they know your size and your direction."*
**Say —** It can ask. The asking is the leak. The moment anyone sees the enquiry they know your size and your direction, and the price moves against you before you trade.
**Katakan —** Boleh bertanya. Pertanyaannya itu sendiri yang bocor. Begitu ada yang melihat enquiry-nya, mereka tahu size dan arah Anda, dan harganya sudah bergerak melawan Anda sebelum Anda sempat trade.

---

## A2. Why not just run this on a transparent chain?
**ID —** Kenapa tidak dijalankan saja di chain yang transparan?
**Slide —** 03 · Privacy, or proof. Never both.
**Point —** the left red card, *"Trade in public / Everything leaks"*.
**Say —** On a transparent chain your request is a transaction and every competing quote is a transaction, so front-running and adverse selection are structural, not incidental.
**Katakan —** Di chain yang transparan, request Anda adalah sebuah transaksi dan setiap quote pesaing juga transaksi, jadi front-running dan adverse selection itu struktural, bukan kebetulan.

---

## A3. A chat room is already private. Why is that not enough?
**ID —** Chat room sudah privat. Kenapa itu belum cukup?
**Slide —** 03 · Privacy, or proof. Never both.
**Point —** the right red card, *"Trade on the phone / Nothing is provable"*.
**Say —** It is private and it leaves no record, so six months later you cannot prove to compliance that you got the best price, and nothing about it is atomic.
**Katakan —** Memang privat, tapi tidak meninggalkan rekam jejak, jadi enam bulan kemudian Anda tidak bisa membuktikan ke compliance bahwa Anda dapat harga terbaik, dan tidak ada satu pun bagiannya yang atomik.

---

## A4. Walk me through one trade, end to end.
**ID —** Coba jelaskan satu trade dari awal sampai selesai.
**Slide —** 04 · The dealer terminal, on the ledger
**Point —** the five-step flow strip, left to right, one finger per step.
**Say —** Five steps: the buyer asks a chosen panel, each dealer answers with a sealed quote, quoting locks that dealer's bond into escrow so a price is a commitment rather than a bluff, the cheapest ask wins, and bond and cash move in one atomic DvP.
**Katakan —** Lima langkah: buyer bertanya ke panel yang dia pilih, tiap dealer menjawab dengan sealed quote, memberi quote mengunci bond dealer itu ke escrow sehingga harga menjadi komitmen bukan gertakan, ask termurah menang, lalu bond dan cash berpindah dalam satu DvP atomik.

---

## A5. Who wins the auction, and what do they actually get paid?
**ID —** Siapa yang menang lelangnya, dan sebenarnya dibayar berapa?
**Slide —** 04 · The dealer terminal, on the ledger
**Point —** step **04 · Award**, the words *"Second price"*.
**Say —** The cheapest ask wins and is paid the runner-up's price, which is why quoting honestly is the dealer's dominant strategy rather than an act of goodwill.
**Katakan —** Ask termurah yang menang, tapi dibayar di harga runner-up, dan justru karena itu memberi quote jujur adalah strategi terbaik dealer, bukan sekadar niat baik.

---

## A6. Is this not just the interface hiding rows from me?
**ID —** Bukankah ini cuma interface yang menyembunyikan baris dari saya?
**Slide —** 05 · Dealer B's node *never received* dealer A's quote
**Point —** the headline, then the left green card line *"zero pre-trade visibility, full post-trade record"*.
**Say —** No: on Canton a contract is delivered only to its signatories and observers, so there is no filter to misconfigure and nothing to decrypt, and the regulator on that card observes executed trades only.
**Katakan —** Bukan: di Canton sebuah contract hanya dikirim ke signatory dan observer-nya, jadi tidak ada filter yang bisa salah setel dan tidak ada yang perlu didekripsi, dan regulator di card itu hanya melihat trade yang sudah tereksekusi.

---

## A7. How would you know if a quote ever did leak?
**ID —** Bagaimana Anda tahu kalau suatu saat ada quote yang bocor?
**Slide —** 05 · Dealer B's node *never received* dealer A's quote
**Point —** the right green card, *"Falsifiable, and falsified / Live privacy verifier"*.
**Say —** A script recomputes each party's visible contract set on the real DevNet ledger and exits non-zero if a single quote ever leaks; it is a test, not a dashboard.
**Katakan —** Ada script yang menghitung ulang contract set yang terlihat oleh tiap party di ledger DevNet yang sebenarnya, dan keluar non-zero kalau ada satu quote saja yang bocor; itu test, bukan dashboard.

---

## A8. Why Canton? You could have built this anywhere.
**ID —** Kenapa Canton? Ini bisa dibangun di mana saja.
**Slide —** 06 · Fifth build. First one the chain did for me.
**Point —** the bottom table row: Tirai / Canton / *"None. Sub-transaction privacy is the ledger model."*
**Say —** I built this thesis four times with TEEs, Groth16 circuits, threshold encryption and FHE; on Canton that column says none, because the guarantee is a `signatory` and `observer` declaration.
**Katakan —** Tesis yang sama sudah saya bangun empat kali dengan TEE, circuit Groth16, threshold encryption, dan FHE; di Canton kolom itu isinya none, karena jaminannya cukup deklarasi `signatory` dan `observer`.

---

## A9. Who actually buys this?
**ID —** Siapa sebenarnya yang membeli ini?
**Slide —** 07 · Desks whose tickets are big enough to leak
**Point —** the first card, *"Primary / Trading desks"*, then the punch line beneath.
**Say —** Fixed-income and crypto-asset desks at banks, asset managers and prop shops moving one to a hundred million a ticket, because below a million leakage is a rounding error and above it leakage is the whole cost.
**Katakan —** Desk fixed-income dan crypto-asset di bank, asset manager, dan prop shop yang memindahkan ticket satu sampai seratus juta, karena di bawah satu juta kebocoran cuma pembulatan, dan di atasnya kebocoran itu justru seluruh biayanya.

---

## A10. How does a solo builder reach institutions at all?
**ID —** Bagaimana seorang solo builder bisa menjangkau institusi?
**Slide —** 07 · Desks whose tickets are big enough to leak
**Point —** the middle card, *"Channel / Hosting venues"*.
**Say —** Through the venues that already hold the client relationship and the custody, Temple, Bron, Console, Canton Loop; Tirai ships as an embedded app and shares the fee.
**Katakan —** Lewat venue yang sudah memegang relasi klien dan custody-nya: Temple, Bron, Console, Canton Loop; Tirai hadir sebagai app yang tertanam di sana dan berbagi fee.

---

## A11. How does it make money?
**ID —** Bagaimana ini menghasilkan uang?
**Slide —** 08 · A venue fee the contract collects itself
**Point —** the left card, *"Per-trade fee / Basis points of notional"*.
**Say —** A per-trade venue fee in basis points of notional, taken in the settlement asset inside the settlement transaction, so if the trade settles the fee is paid, with no invoicing and no collection risk.
**Katakan —** Venue fee per trade dalam basis point dari notional, diambil dalam settlement asset di dalam transaksi settlement itu sendiri, jadi kalau trade-nya settle fee-nya terbayar, tanpa invoice dan tanpa risiko penagihan.

---

## A12. What is the rate, and what have you earned so far?
**ID —** Berapa tarifnya, dan sejauh ini Anda sudah menghasilkan berapa?
**Slide —** 08 · A venue fee the contract collects itself
**Point —** the last sentence of the left card, then the footer strip *"Zero revenue today · no paying customer"*.
**Say —** The rate is deliberately unset, because it should come out of a design-partner conversation rather than out of my head, and the footer answers the second half: zero revenue, no paying customer.
**Katakan —** Tarifnya sengaja belum ditetapkan, karena angka itu harus keluar dari percakapan dengan design partner, bukan dari kepala saya, dan footer-nya menjawab sisanya: pendapatan nol, belum ada customer yang membayar.

---

## A13. How is this different from Tradeweb, or from the other Canton privacy demos?
**ID —** Apa bedanya ini dengan Tradeweb, atau dengan demo privasi Canton yang lain?
**Slide —** 09 · Not a DEX. Not a chat room.
**Point —** the third and fourth table rows.
**Say —** Each alternative fails on exactly one axis: at the incumbent venues the venue itself sees everything, and the other Canton demos show the chain can keep a secret but do not run a market.
**Katakan —** Tiap alternatif gagal tepat di satu sumbu: di venue incumbent, venue-nya sendiri melihat semuanya, dan demo Canton lain menunjukkan chain-nya bisa menyimpan rahasia tapi tidak menjalankan pasar.

---

## A14. What is actually live right now?
**ID —** Apa yang benar-benar sudah live sekarang?
**Slide —** 10 · Not a mock-up
**Point —** the four stat tiles, then the `tirai.vercel.app` line under them.
**Say —** Two DevNet participants running the same package including HackCanton's own node, the settled trades and five atomic baskets on that tile, sixteen best-execution attestations, forty-four Daml scripts green, and a hosted read-only desk over live ledger state.
**Katakan —** Dua participant DevNet menjalankan package yang sama termasuk node milik HackCanton sendiri, settled trade dan lima basket atomik di tile itu, enam belas attestation best execution, empat puluh empat Daml script hijau, dan hosted desk read-only di atas state ledger yang hidup.

> Read the settled-trade number **off the tile**, not from memory, until the deck, the
> README and `PITCH.md` agree. See "Before Wednesday", and Part B1.

---

## A15. Is that ledger history traction?
**ID —** Riwayat di ledger itu apakah traction?
**Slide —** 10 · Not a mock-up
**Point —** the small grey line at the foot of the slide, *"Honest label…"*.
**Say —** No, and the slide says it before you ask: I generated that history, it demonstrates the product works, and it is not customer traction.
**Katakan —** Bukan, dan slide-nya sudah bilang sebelum Anda bertanya: riwayat itu saya sendiri yang buat, itu membuktikan produknya jalan, bukan membuktikan ada customer.

---

## A16. With no order book, how can you prove best execution?
**ID —** Tanpa order book, bagaimana Anda bisa membuktikan best execution?
**Slide —** 11 · The claim is checked against the live ledger
**Point —** the right green card, *"Best execution / Proof without an order book"*.
**Say —** A buyer, or a dealer defending its pricing, discloses a single sealed quote to the regulator, and sixteen attestations prove the clearing price beat every disclosed rival ask.
**Katakan —** Buyer, atau dealer yang membela harganya sendiri, membuka satu sealed quote ke regulator, dan enam belas attestation membuktikan clearing price-nya mengalahkan setiap ask rival yang di-disclose.

---

## A17. Is the cash leg real, or your own play money?
**ID —** Cash leg-nya nyata, atau uang mainan Anda sendiri?
**Slide —** 12 · Two assets. Neither of them mine.
**Point —** the lede, then the first two cards, *"Canton Coin / 6 settlements"* and *"CBTC / 0.34 + 0.22"*.
**Say —** Neither asset is mine: six trades settled in real Canton Coin through the DSO's registry, 60,900 CC to the winning dealers, and two in real CBTC through the DA Utility Registry that BitSafe issues on.
**Katakan —** Dua-duanya bukan aset saya: enam trade settle dalam Canton Coin sungguhan lewat registry milik DSO, 60.900 CC berpindah ke dealer pemenang, dan dua trade dalam CBTC sungguhan lewat DA Utility Registry tempat BitSafe menerbitkan.

---

## A18. You targeted cETH. Where is it?
**ID —** Target Anda cETH. Mana cETH-nya?
**Slide —** 12 · Two assets. Neither of them mine.
**Point —** the third card, *"cETH / One field away"*, then the `cashInstrument` line beneath.
**Say —** The instrument administrator is the only difference, so the rail appears in the desk the day the tokens land with no release in between, and I will not claim a cETH trade before one exists.
**Katakan —** Yang berbeda hanya administrator instrument-nya, jadi rail-nya muncul di desk pada hari token-nya turun tanpa perlu rilis di antaranya, dan saya tidak akan mengklaim ada trade cETH sebelum trade itu benar-benar ada.

---

## A19. You have no design partner. Why should we believe the next ninety days?
**ID —** Anda belum punya design partner. Kenapa kami harus percaya sembilan puluh hari ke depan?
**Slide —** 13 · One person. Fifth implementation. Five days.
**Point —** the right red card, *"What I will not dress up"*, then the line beneath it about the 90-day plan.
**Say —** The gaps are on the slide rather than hidden, and since your feedback there is a written 90-day plan with the stop criteria set in advance, because a plan that cannot fail is not a plan.
**Katakan —** Kekurangannya ada di slide, bukan disembunyikan, dan sejak feedback Anda ada rencana 90 hari tertulis dengan stop criteria yang ditetapkan di depan, karena rencana yang tidak mungkin gagal itu bukan rencana.

---

## A20. What do you want from us?
**ID —** Apa yang Anda inginkan dari kami?
**Slide —** 14 · Price discovery happens behind it.
**Point —** the three numbered tags across the bottom.
**Say —** Three things in priority order: one trading desk as a design partner, the cETH and CBTC test-token grants, and a hosting venue for a supervised pilot. One hour a week for ninety days, not a purchase order.
**Katakan —** Tiga hal, berurutan sesuai prioritas: satu trading desk sebagai design partner, grant test token cETH dan CBTC, dan satu hosting venue untuk pilot yang terawasi. Satu jam seminggu selama sembilan puluh hari, bukan purchase order.

---

# Part B. The deck does not answer it

No slide will save you. Answer, then stop. Every one of these is a question I would ask.

---

## B1. Your slide says one settled-trade count and your README says another. Which is it?
**ID —** Slide Anda menyebut satu angka settled trade, README Anda angka lain. Yang mana yang benar?
**Slide —** not in the deck
**Say —** They agree now: fifty settled trades and five atomic baskets on the shared validator, sixteen attestations, forty-four Daml scripts. They did not always, and the drift was real — the deck, the README and my own notes each carried a different count for a while, because every one of them was hand-written from a ledger that kept moving. Every trade is on the ledger and countable, which is why the disagreement was embarrassing rather than dangerous. If you find one that still disagrees, the validator is the answer and the document is wrong; I would rather correct myself than defend a stale slide.
**Katakan —** Sekarang sudah sama: lima puluh settled trade dan lima basket atomik di shared validator, enam belas attestation, empat puluh empat Daml script. Dulu memang tidak sama, dan pergeserannya nyata — deck, README, dan catatan saya sempat membawa angka yang berbeda-beda, karena semuanya ditulis tangan dari ledger yang terus bergerak. Semua trade-nya ada di ledger dan bisa dihitung, jadi ketidakcocokan itu memalukan, bukan berbahaya. Kalau Anda menemukan satu yang masih berbeda, validator-nya yang benar dan dokumennya yang salah; lebih baik saya mengoreksi diri daripada membela slide yang basi.

---

## B2. The deck says the contract collects the fee. Is there a fee in the ledger model?
**ID —** Deck Anda bilang contract-nya memungut fee sendiri. Apakah fee itu benar ada di ledger model?
**Slide —** not in the deck
**Say —** Yes. The RFQ carries a venue and a rate in basis points, and the cut is split off the cleared amount before the dealer is paid — all three cash settlement paths go through one function, so a new path cannot quietly skip it. The trade report records the amount, which matters: the auditor reads the fee off the trade rather than inferring it from someone's wallet. One settlement on DevNet cleared 4,250,000 at 25 bps — 10,625 to the venue, 4,239,375 to the dealer, and the buyer paid exactly the clearing price, because the fee comes out of the dealer's proceeds and not on top of the trade. What is still not true: the rate is unset by default, the registry rail takes no fee because that cash moves through the issuer's allocation, and revenue is zero.
**Katakan —** Ada. RFQ-nya membawa venue dan tarif dalam basis point, dan potongannya dipisahkan dari jumlah yang cleared sebelum dealer dibayar — ketiga jalur settlement kas lewat satu fungsi yang sama, jadi jalur baru tidak bisa diam-diam melewatinya. Trade report mencatat nominalnya, dan itu yang penting: auditor membaca fee-nya dari trade, bukan menyimpulkannya dari saldo dompet orang. Satu settlement di Devnet cleared 4.250.000 pada 25 bps — 10.625 ke venue, 4.239.375 ke dealer, dan buyer membayar persis harga clearing, karena fee-nya keluar dari hasil dealer, bukan ditambahkan di atas trade. Yang belum benar: tarifnya default kosong, rail registry tidak memungut fee karena kas-nya lewat alokasi issuer, dan pendapatannya nol.

---

## B3. Why basis points of notional rather than a subscription, like a terminal?
**ID —** Kenapa basis point dari notional, bukan langganan seperti terminal?
**Slide —** not in the deck
**Say —** Because a subscription prices seats and this prices outcomes. A desk that clears nothing pays nothing, which makes a first pilot cheap to say yes to, and the fee scales with exactly the thing the product protects, which is notional at risk of leaking. The honest counter is that a terminal earns through the quiet months and I would not. `[assumption]` The right structure is probably a floor plus basis points, and that is precisely the argument I want a design partner to have with me.
**Katakan —** Karena langganan itu menagih per kursi, sedangkan ini menagih per hasil. Desk yang tidak clearing apa pun tidak membayar apa pun, sehingga pilot pertama murah untuk disetujui, dan fee-nya naik seiring hal yang justru dilindungi produk ini, yaitu notional yang berisiko bocor. Bantahan jujurnya: terminal tetap dapat uang di bulan-bulan sepi, saya tidak. `[asumsi]` Struktur yang benar mungkin floor plus basis point, dan itu persis perdebatan yang saya inginkan dengan design partner.

---

## B4. What does it cost you to run one trade?
**ID —** Berapa biaya Anda untuk menjalankan satu trade?
**Slide —** not in the deck
**Say —** I do not have a measured number, and I will not invent one. The marginal cost of a trade is a Canton transaction plus the participant node the party is hosted on, and network traffic is paid in Canton Coin, so most of that cost sits with whoever runs the node rather than with me. `[assumption]` For a hosted deployment the real cost is the node and the operations around it, not the per-transaction fee. I have not modelled it, and modelling it properly needs a venue's actual bill.
**Katakan —** Saya belum punya angka terukur, dan saya tidak akan mengarangnya. Biaya marginal satu trade adalah satu transaksi Canton plus participant node tempat party-nya dihosting, dan traffic jaringannya dibayar dengan Canton Coin, jadi sebagian besar biaya itu ada di pihak yang menjalankan node, bukan di saya. `[asumsi]` Untuk deployment yang dihosting, biaya nyatanya adalah node dan operasionalnya, bukan fee per transaksi. Saya belum memodelkannya, dan memodelkannya dengan benar butuh tagihan asli sebuah venue.

---

## B5. Who is the legal custodian of the escrowed bond and of the cash?
**ID —** Siapa custodian legal dari bond yang di-escrow dan dari cash-nya?
**Slide —** not in the deck
**Say —** Legally, nobody yet, and that is a real gap rather than an oversight. On the ledger the escrowed bond sits in a holding that needs both dealer and buyer to release, and the cash sits inside the registry's own allocation until settlement, so operationally nothing passes through my hands. But there is no custodian, no KYC, no onboarding and no legal wrapper anywhere in this build. A hosting venue brings all four, which is one of the three things I am asking for.
**Katakan —** Secara hukum, belum ada, dan itu memang lubang yang nyata, bukan kelupaan. Di ledger, bond yang di-escrow ada di holding yang pelepasannya butuh dealer dan buyer sekaligus, dan cash-nya ada di dalam allocation milik registry sampai settlement, jadi secara operasional tidak ada yang lewat tangan saya. Tapi di build ini tidak ada custodian, tidak ada KYC, tidak ada onboarding, dan tidak ada pembungkus hukum. Keempatnya dibawa oleh hosting venue, dan itu salah satu dari tiga permintaan saya.

---

## B6. Where do the bonds come from? Is the bond leg a real instrument?
**ID —** Bond-nya dari mana? Apakah bond leg-nya instrumen sungguhan?
**Slide —** not in the deck
**Say —** No. The bonds are desk-issued for the demonstration: the parties are mine and the instruments are mine. The half I do not control is the cash leg, Canton Coin from the DSO's registry and CBTC from the registry BitSafe issues on. In a pilot the bond leg would come from a tokenised bond issuer, and that is the second design-partner profile in my written plan. I would rather be exact about which side of the trade is real than let the settlement claim cover both.
**Katakan —** Bukan. Bond-nya diterbitkan oleh desk sendiri untuk demonstrasi: party-nya milik saya dan instrument-nya milik saya. Bagian yang bukan saya kendalikan adalah cash leg-nya, Canton Coin dari registry DSO dan CBTC dari registry tempat BitSafe menerbitkan. Di sebuah pilot, bond leg-nya akan datang dari penerbit obligasi ter-tokenisasi, dan itu profil design partner kedua di rencana tertulis saya. Saya lebih memilih jelas sisi mana yang nyata daripada membiarkan klaim settlement menutupi keduanya.

---

## B7. Do you need a licence to operate this, and under which regulator?
**ID —** Apakah ini butuh lisensi untuk dioperasikan, dan di bawah regulator mana?
**Slide —** not in the deck
**Say —** To run a venue carrying real flow, almost certainly yes, and I have not done that work. `[assumption]` The shape I built to is existing block-trading practice, which permits pre-trade opacity for large orders and then demands full post-trade reporting, and the regulator sits in the model as an observer of executed trades. But the best-execution attestation is a ledger construct, not a filing in any jurisdiction's required format, and no supervisor has told me it would be accepted. That is a compliance conversation my 90-day plan schedules, not a claim I can make today.
**Katakan —** Untuk menjalankan venue dengan flow sungguhan, hampir pasti ya, dan pekerjaan itu belum saya lakukan. `[asumsi]` Bentuk yang saya ikuti adalah praktik block trading yang sudah ada, yang mengizinkan keburaman pre-trade untuk order besar lalu menuntut pelaporan post-trade yang penuh, dan regulator ada di dalam model sebagai observer trade yang tereksekusi. Tapi attestation best execution itu konstruksi ledger, bukan pelaporan dalam format wajib yurisdiksi mana pun, dan belum ada regulator yang bilang itu diterima. Itu percakapan compliance yang dijadwalkan di rencana 90 hari saya, bukan klaim yang bisa saya buat hari ini.

---

## B8. Every dealer needs a participant node. Who pays for that?
**ID —** Tiap dealer harus punya participant node. Siapa yang membayarnya?
**Slide —** not in the deck
**Say —** The dealer, or the venue hosting it, and this is the real adoption cost. It is an onboarding problem rather than an engineering one, and it is the slowest step: on HackCanton's node, party allocation and DAR vetting are participant-admin only and the operators did both on request. For a desk already running a Canton validator for cETH or Canton Coin, the marginal cost is one party allocation. For everyone else it is a procurement conversation, and a panel is five names, not five thousand.
**Katakan —** Dealer-nya, atau venue yang menghostingnya, dan inilah biaya adopsi yang sebenarnya. Ini masalah onboarding, bukan masalah teknik, dan justru langkah paling lambat: di node HackCanton, party allocation dan vetting DAR hanya bisa oleh participant admin, dan operatornya melakukan keduanya atas permintaan. Untuk desk yang sudah menjalankan validator Canton demi cETH atau Canton Coin, biaya marginalnya cuma satu party allocation. Untuk yang lain, itu percakapan procurement, dan satu panel isinya lima nama, bukan lima ribu.

---

## B9. A participant node operator can read its tenants' contracts. Does that not defeat the point for a bank?
**ID —** Operator participant node bisa membaca contract tenant-nya. Bukankah itu menggugurkan tujuannya bagi sebuah bank?
**Slide —** not in the deck
**Say —** It is a real limit and worth stating plainly. Canton hides contracts between parties, not from the participant node hosting them, so a dealer that cares must run its own node or trust its host, exactly as it trusts a custodian today. That is still a different trust model from a public chain, where everyone sees everything, and from a venue database, where the operator sees every enquiry. If a partner needs data hidden from its own host, that is the one place where zero-knowledge machinery would come back.
**Katakan —** Itu batasan yang nyata dan pantas dikatakan terang-terangan. Canton menyembunyikan contract antar party, bukan dari participant node yang menghosting mereka, jadi dealer yang peduli harus menjalankan node-nya sendiri atau memercayai host-nya, persis seperti dia memercayai custodian hari ini. Itu tetap model kepercayaan yang berbeda dari chain publik, di mana semua orang melihat semuanya, dan dari database venue, di mana operatornya melihat setiap enquiry. Kalau ada partner yang butuh datanya tersembunyi dari host-nya sendiri, di situlah mesin zero-knowledge kembali relevan.

---

## B10. Has the Daml model been audited, and what is the worst bug you know about?
**ID —** Apakah model Daml-nya sudah diaudit, dan bug terburuk yang Anda tahu apa?
**Slide —** not in the deck
**Say —** No third-party audit, and that is not optional before real money. What exists is forty-four Daml scripts covering the two privacy guarantees, the award logic, wrong-instrument and forged-allocation rejection, plus the verifier running on the live network. I can name the worst bug because I found it in that award path and fixed it. The choice takes an explicit list of quote ids from the buyer, and nothing on the ledger says that list is every quote received. Dropping one while two remain raises what the buyer pays, so it punishes itself — but dropping all but the winner left no second price, and the code fell back to the winner's own ask. A first-price auction wearing a Vickrey label, chosen by the buyer after seeing every sealed number, with the dropped quote never revealed to anyone. It is refused now: an auction needs two quotes, and a buyer that wants to lift an ask uses the direct rail, which is recorded as direct. `testCannotShedSecondPrice` is the regression test.
**Katakan —** Belum ada audit pihak ketiga, dan sebelum uang sungguhan itu bukan pilihan. Yang ada adalah empat puluh empat Daml script yang mencakup dua jaminan privasi, logika award, penolakan instrument yang salah dan allocation palsu, plus verifier yang berjalan di jaringan yang hidup. Saya bisa menyebut bug terburuknya karena saya menemukannya sendiri di jalur award itu, dan sudah diperbaiki. Choice-nya menerima daftar id quote dari buyer, dan tidak ada apa pun di ledger yang menjamin daftar itu berisi semua quote yang masuk. Menghilangkan satu ketika masih tersisa dua justru menaikkan harga yang dibayar buyer, jadi itu merugikan dirinya sendiri — tapi menghilangkan semuanya kecuali pemenang membuat harga kedua tidak ada, dan kode lama jatuh balik ke ask si pemenang. Itu lelang first-price yang memakai label Vickrey, dipilih buyer setelah dia melihat semua angka tersegel, sementara quote yang dibuang tidak pernah terlihat oleh siapa pun. Sekarang ditolak: lelang butuh dua quote, dan buyer yang mau mengambil sebuah ask harus lewat jalur direct, yang tercatat sebagai direct. Regression test-nya `testCannotShedSecondPrice`.

---

## B11. Your hosted desk holds a machine credential server-side. What if it leaks?
**ID —** Hosted desk Anda menyimpan machine credential di sisi server. Bagaimana kalau bocor?
**Slide —** not in the deck
**Say —** The blast radius is reads, not writes. The proxy rejects every write path with a 403 and a self-test asserts it, including a regression test for the enumeration bypass where a query asks for any party. If the credential leaked, someone could read what those four DevNet parties already show on a public demo site, and the fix is a rotation. It is a demonstration deployment, not a production security posture, and I would not host a real desk this way.
**Katakan —** Dampaknya sebatas baca, bukan tulis. Proxy-nya menolak setiap jalur tulis dengan 403 dan ada self-test yang menegakkannya, termasuk regression test untuk bypass enumerasi lewat query yang meminta party mana saja. Kalau credential-nya bocor, orang bisa membaca apa yang memang sudah ditampilkan empat party DevNet itu di situs demo publik, dan perbaikannya adalah rotasi. Ini deployment demonstrasi, bukan postur keamanan produksi, dan desk sungguhan tidak akan saya hosting seperti ini.

---

## B12. All four parties are yours. How do you know privacy holds between two real firms?
**ID —** Keempat party itu milik Anda. Bagaimana Anda tahu privasinya bertahan antara dua perusahaan yang berbeda?
**Slide —** not in the deck
**Say —** Because the boundary being tested is the participant node, not the company. The verifier recomputes each party's visible contract set on the live network, and it is green on two separate participants, one of them HackCanton's own node, which I do not operate. Privacy comes from which node receives which contract, and that does not care whether two parties share a beneficial owner. What I cannot show you is two firms under separate legal control using it, and that is a pilot rather than a test.
**Katakan —** Karena yang diuji adalah batas participant node, bukan batas perusahaan. Verifier-nya menghitung ulang contract set yang terlihat tiap party di jaringan yang hidup, dan hasilnya hijau di dua participant terpisah, salah satunya node milik HackCanton sendiri yang bukan saya yang jalankan. Privasinya berasal dari node mana yang menerima contract mana, dan itu tidak peduli apakah dua party dimiliki orang yang sama. Yang belum bisa saya tunjukkan adalah dua perusahaan dengan kendali hukum berbeda memakainya, dan itu urusan pilot, bukan test.

---

## B13. The demo video does not look like the live desk. Why?
**ID —** Video demo-nya tidak mirip desk yang live. Kenapa?
**Slide —** not in the deck
**Say —** Because it records the earlier three-column layout, where the buyer, both dealers and the regulator sat side by side on one screen. The desk has since become a single signed-in identity: you pick a party in the sidebar and see only what that party's node holds. The old view survives as a sidebar entry called Side-by-side proof. Nothing the video claims about the ledger has changed, only the layout, and I say that before showing it rather than after being asked.
**Katakan —** Karena yang terekam adalah layout tiga kolom yang lama, di mana buyer, dua dealer, dan regulator duduk berdampingan dalam satu layar. Sejak itu desk-nya berubah menjadi satu identitas yang login: Anda memilih party di sidebar dan hanya melihat apa yang dipegang node party itu. View lama masih ada sebagai menu sidebar bernama Side-by-side proof. Tidak ada klaim soal ledger di video itu yang berubah, hanya layout-nya, dan saya menyebutkan itu sebelum memutarnya, bukan setelah ditanya.

---

## B14. What if the cETH grant never arrives?
**ID —** Bagaimana kalau grant cETH-nya tidak pernah turun?
**Slide —** not in the deck
**Say —** Then nothing structural changes, which is exactly why I settled in Canton Coin and CBTC first. The cash instrument is an administrator plus an id, so a third registry is configuration rather than engineering, and the desk already clears against two issuers I do not control. cETH matters because two bounty briefs asked for confidential RFQ and I wanted to answer them in their own asset. If it never lands, what I lose is that specific claim, not the capability.
**Katakan —** Maka tidak ada yang berubah secara struktural, dan justru itu alasan saya menyelesaikan Canton Coin dan CBTC lebih dulu. Cash instrument itu administrator plus id, jadi registry ketiga cuma soal konfigurasi, bukan soal membangun, dan desk-nya sudah clearing melawan dua issuer yang bukan saya kendalikan. cETH penting karena dua brief bounty meminta RFQ yang rahasia dan saya ingin menjawabnya dengan aset mereka sendiri. Kalau tidak pernah turun, yang hilang adalah klaim spesifik itu, bukan kemampuannya.

---

## B15. What stops a hosting venue building this themselves in a month?
**ID —** Apa yang mencegah sebuah hosting venue membangun ini sendiri dalam sebulan?
**Slide —** not in the deck
**Say —** Nothing, and that is a fair reading. The privacy is Canton's and it is free to everyone. What is not free is the mechanism and the four failed versions behind it: the Vickrey selection rules, escrow on quote, partial fills, baskets, the disclosure paths, the attestation. This is the fifth implementation of one thesis and the first four taught me what breaks. If a venue would rather embed or buy it than spend that month, that is a business outcome I would take, not one I would fight.
**Katakan —** Tidak ada, dan itu pembacaan yang adil. Privasinya milik Canton dan gratis untuk semua orang. Yang tidak gratis adalah mekanismenya dan empat versi gagal di belakangnya: aturan seleksi Vickrey, escrow saat quote, partial fill, basket, jalur disclosure, dan attestation-nya. Ini implementasi kelima dari satu tesis, dan empat yang pertama mengajari saya apa yang jebol. Kalau sebuah venue lebih memilih menanam atau membeli daripada menghabiskan sebulan itu, itu hasil bisnis yang saya terima, bukan yang saya lawan.

---

## B16. As a dealer, how do I know the buyer ran a fair auction and did not favour a friend?
**ID —** Sebagai dealer, bagaimana saya tahu buyer menjalankan lelang yang adil dan bukan memenangkan temannya?
**Slide —** not in the deck
**Say —** You do not have to trust the buyer's discretion, but you should know its limit. The award takes an explicit list of quotes, and the ledger enforces one quote per dealer, a matching RFQ, a deterministic sort, the second price, and at least two quotes. That last one closes the only way discretion paid: with everyone but the winner dropped there was no second price and the winner took its own ask, which is first price under another name. Now dropping quotes while two remain only raises what the buyer pays, and dropping down to one is refused. What the ledger still cannot prove is that the buyer invited you at all. That is panel membership, and panel membership is a venue rulebook question.
**Katakan —** Anda tidak perlu memercayai kebijakan buyer, tapi Anda perlu tahu batasnya. Award-nya menerima daftar quote yang eksplisit, dan ledger-nya menegakkan satu quote per dealer, RFQ yang cocok, urutan yang deterministik, second price, dan minimal dua quote. Yang terakhir itu menutup satu-satunya celah di mana kebijakan buyer menguntungkan dirinya: kalau semua kecuali pemenang dibuang, harga kedua tidak ada dan pemenang menerima ask-nya sendiri — itu first price dengan nama lain. Sekarang membuang quote selama masih tersisa dua hanya menaikkan harga yang dibayar buyer, dan memangkasnya jadi satu ditolak. Yang tetap tidak bisa dibuktikan ledger adalah apakah buyer mengundang Anda sejak awal. Itu soal keanggotaan panel, dan keanggotaan panel adalah urusan rulebook sebuah venue.

---

## B17. What did you inherit from your earlier project, and what is new for this hackathon?
**ID —** Apa yang Anda warisi dari proyek sebelumnya, dan apa yang baru untuk hackathon ini?
**Slide —** not in the deck
**Say —** Disclosed in the README, the submission and the journal. From Bisik came the RFQ, sealed-quote and escrow model. New for HackCanton is the whole CIP-0056 settlement leg: the token trade, the allocation-request interface instance, award with allocation, the direct OTC conversion, settle, cancel and expire, moving the holdings onto the real Splice holding interface, deleting the fake in-package token standard, the second DevNet deployment, the hosted desk, and settlement in real Canton Coin and real CBTC.
**Katakan —** Sudah saya ungkap di README, di submission, dan di journal. Dari Bisik: model RFQ, sealed quote, dan escrow. Yang baru untuk HackCanton adalah seluruh settlement leg CIP-0056: token trade-nya, instance interface allocation request, award with allocation, konversi direct OTC, settle, cancel, dan expire, memindahkan holding ke interface holding Splice yang asli, menghapus token standard palsu di dalam package, deployment DevNet kedua, hosted desk, dan settlement dalam Canton Coin dan CBTC sungguhan.

---

## B18. You are one person. What happens to a live desk if you stop?
**ID —** Anda sendirian. Apa jadinya desk yang sudah live kalau Anda berhenti?
**Slide —** not in the deck
**Say —** For a venue that is a genuine risk and I will not talk it away: no SLA, no support rota, no third-party audit, no operational cover. Two things reduce it. The model is Daml in a public MIT repository with forty-four tests, so it is readable and forkable rather than a black box. And my ask is a DevNet design partner, where one person is not the binding constraint. Before real flow this needs a team or an owner, not a solo builder.
**Katakan —** Bagi sebuah venue itu risiko nyata dan tidak akan saya putar-putar: tidak ada SLA, tidak ada rota dukungan, tidak ada audit pihak ketiga, tidak ada cadangan operasional. Dua hal menguranginya. Model-nya adalah Daml di repo publik berlisensi MIT dengan empat puluh empat test, jadi bisa dibaca dan di-fork, bukan kotak hitam. Dan permintaan saya adalah design partner di DevNet, di mana satu orang bukan kendala yang mengikat. Sebelum flow sungguhan, ini butuh tim atau pemilik, bukan solo builder.

---

## B19. What breaks first when a partner starts using this on Monday?
**ID —** Apa yang jebol duluan kalau seorang partner mulai memakainya hari Senin?
**Slide —** not in the deck
**Say —** Onboarding, before any of the interesting failures. Allocating their dealer party and getting the package vetted on a node is the first wall, and my own plan makes it a stop condition if a first trade takes more than five working days. After that, capital: escrow on quote is fully collateralised, so a dealer quoting several clients locks a lot for each one. The privacy does not degrade with volume. The capital efficiency and the onboarding do.
**Katakan —** Onboarding, jauh sebelum kegagalan yang menarik. Tembok pertamanya adalah mengalokasikan party dealer mereka dan membuat package-nya di-vetting di sebuah node, dan rencana saya sendiri menjadikannya stop condition kalau trade pertama butuh lebih dari lima hari kerja. Setelah itu, soal modal: escrow saat quote ter-collateral penuh, jadi dealer yang memberi quote ke beberapa klien harus mengunci satu lot untuk masing-masing. Privasinya tidak melemah seiring volume. Efisiensi modal dan onboarding-nya yang melemah.

---

## B20. Is Tirai a company, or a feature a venue should buy?
**ID —** Tirai ini perusahaan, atau fitur yang seharusnya dibeli sebuah venue?
**Slide —** not in the deck
**Say —** I do not know yet, and my plan is written so that ninety days answers it rather than my preference. If a design partner names a price and the gate list is reachable, it is a venue product. If the gate list needs a licence, custody permissions or a capitalised entity, then the honest conclusion is that this is infrastructure to be sold to a venue that already has the panel and the compliance. I would rather find that out early than defend the wrong shape for a year.
**Katakan —** Saya belum tahu, dan rencana saya ditulis supaya sembilan puluh hari yang menjawabnya, bukan selera saya. Kalau design partner menyebut harga dan daftar gate-nya terjangkau, ini produk venue. Kalau daftar gate-nya menuntut lisensi, izin custody, atau entitas bermodal, maka kesimpulan jujurnya adalah ini infrastruktur yang dijual ke venue yang sudah punya panel dan compliance-nya. Saya lebih memilih tahu itu lebih awal daripada membela bentuk yang salah selama setahun.

---

# Added after the venue fee shipped

*Three questions that did not exist this morning. The fee went from a design to a
settlement on DevNet on pitch day, and a judge who read the repo yesterday will
notice. Answer them before they have to ask.*

---

## B21. You shipped the revenue model on the day of the final. Is that not building for the judges?
**ID —** Anda mengirim model pendapatannya tepat di hari final. Bukankah itu membangun demi juri?
**Slide —** not in the deck
**Say —** Fair challenge, and the honest answer is: partly. The judges' feedback named the business model, and I had a slide claiming a fee the contract could collect while the contract could not. Two ways to fix that — soften the slide, or build the thing. I built it, and it is a small change because settlement was already one atomic transaction, so the fee is one more leg of a transaction that already existed. What I did not do is dress it up: the rate is still unset, the registry rail still takes nothing, revenue is still zero, and the deck says all three. If it had needed a week of work I would have softened the slide instead.
**Katakan —** Pertanyaan yang adil, dan jawaban jujurnya: sebagian ya. Umpan balik juri menyebut model bisnis, dan saya punya slide yang mengklaim fee yang bisa dipungut contract padahal contract-nya belum bisa. Ada dua cara memperbaikinya — melunakkan slide-nya, atau membangunnya. Saya membangunnya, dan itu perubahan kecil karena settlement-nya memang sudah satu transaksi atomik, jadi fee-nya cuma satu leg tambahan di transaksi yang sudah ada. Yang tidak saya lakukan adalah mempercantiknya: tarifnya masih kosong, rail registry masih tidak memungut apa pun, pendapatannya masih nol, dan deck-nya menyebut ketiganya. Kalau butuh kerja seminggu, saya akan melunakkan slide-nya saja.

---

## B22. There are three versions of your package on that validator. What happened to the contracts created under the first one?
**ID —** Ada tiga versi package Anda di validator itu. Apa yang terjadi pada contract yang dibuat di versi pertama?
**Slide —** not in the deck
**Say —** They are still there and still readable, which is the whole point of Canton's smart-contract upgrades. Both new fields are `Optional` and appended, so an RFQ written under 0.1.0 reads under 0.3.0 with no venue and no fee, and a trade report from last week shows a dash rather than a zero — "settled free" and "written before the fee existed" are different claims and the desk does not blur them. I did not take that on trust: `daml.yaml` declares the deployed 0.1.0 DAR as the upgrade base, so the compiler checks every change against what the ledger actually holds, and before each upload I rehearsed it on a sandbox that already had the old version, submitting the *old* client's payload and confirming it still created. Thirteen checks, twice.
**Katakan —** Semuanya masih ada dan masih terbaca, dan itulah inti smart-contract upgrade di Canton. Kedua field barunya `Optional` dan ditambahkan di akhir, jadi RFQ yang ditulis di 0.1.0 terbaca di 0.3.0 tanpa venue dan tanpa fee, dan trade report minggu lalu tampil sebagai strip, bukan nol — "settle tanpa biaya" dan "ditulis sebelum fee-nya ada" itu dua klaim berbeda dan desk-nya tidak mengaburkannya. Saya tidak menerimanya begitu saja: `daml.yaml` mendeklarasikan DAR 0.1.0 yang ter-deploy sebagai basis upgrade, jadi compiler memeriksa setiap perubahan terhadap apa yang benar-benar dipegang ledger, dan sebelum tiap upload saya menggeladinya di sandbox yang sudah memegang versi lama, mengirim payload klien *lama* dan memastikan masih bisa create. Tiga belas pemeriksaan, dua kali.

---

## B23. Your fee works on desk cash but not on Canton Coin. Is the revenue model real, then?
**ID —** Fee Anda jalan di kas desk tapi tidak di Canton Coin. Kalau begitu model pendapatannya nyata atau tidak?
**Slide —** not in the deck
**Say —** It is real on the path where the desk holds the cash leg, and it is genuinely missing on the registry path. On Canton Coin or CBTC the payment moves through the issuer's own allocation and transfer instruction; the desk never holds a splittable position, so there is nothing to take a cut from at that moment. Two ways out, and both need the partner conversation rather than more code from me: a second allocation for the fee in the same settlement, or the venue invoicing off-ledger, which is exactly the collection risk I built this to avoid. I would rather show you the edge than let you find it.
**Katakan —** Nyata di jalur ketika desk memegang leg kas-nya, dan memang benar-benar tidak ada di jalur registry. Di Canton Coin atau CBTC, pembayarannya bergerak lewat alokasi dan transfer instruction milik issuer; desk-nya tidak pernah memegang posisi yang bisa dipecah, jadi tidak ada yang bisa dipotong pada saat itu. Ada dua jalan keluar, dan keduanya butuh percakapan dengan partner alih-alih kode tambahan dari saya: alokasi kedua khusus fee di settlement yang sama, atau venue menagih di luar ledger — yang justru risiko penagihan yang ingin saya hindari sejak awal. Saya lebih baik menunjukkan sisi lemahnya daripada membiarkan Anda menemukannya sendiri.
