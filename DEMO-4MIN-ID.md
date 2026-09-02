# Tirai — 4 menit, versi paham dulu

Kamu tetap **ngomong bahasa Inggris** di sesi itu. File ini bukan pengganti
`DEMO-4MIN.md`, tapi supaya kamu tahu *apa* yang kamu ucapkan dan kenapa — jadi kalau
pertanyaannya datang beda dari yang ditulis, kamu bisa nyusun sendiri, bukan lupa naskah.

Pola tiap beat: **klik** → *kalimat Inggris yang kamu baca* → **arti + kenapa kalimat itu**.

---

## Spine 4 menit

### 0:00–0:20 · Pembuka
> *"Thanks Jason. I'm going to skip straight to the thing a screenshot can't show you,
> which is a dealer's node not receiving something. This is a live participant node on
> my machine — I'd have pointed at the hosted Devnet desk, but its service credentials
> expired last week and I'd rather show you something real than something cached."*

**Artinya:** "Makasih Jason. Aku langsung ke hal yang tidak bisa ditunjukkan screenshot:
node seorang dealer yang *tidak menerima* sesuatu. Ini node participant hidup di mesinku
— aku sebenarnya mau menunjuk desk Devnet yang di-hosting, tapi kredensial layanannya
kedaluwarsa minggu lalu, dan aku lebih suka menunjukkan yang nyata daripada yang basi."

**Kenapa begini:** Jason baru saja membaca intro panjang. Kalau kamu mengulanginya, kamu
membuang 30 detik dari 240 detik yang kamu punya. Dan menyebut kredensial mati *duluan*
mengubahnya dari aib jadi kejujuran. Kalau orang lain yang menemukannya, itu proyek mati.
Kalau kamu yang bilang, itu rotasi kunci.

### 0:20–0:50 · Buka lelangnya
**Klik:** `Create RFQ` → `Auction` → instrumen `TBOND30`, qty `1000` → `Open the auction`
→ lalu `Side-by-side proof` di sidebar.

> *"A buyer wants a thirty-year treasury, a thousand units. Two dealers are invited. The
> market never sees that this exists — not the instrument, not the size."*
> *"Three columns, three participant nodes: the buyer, and the two dealers. Not three
> apps. One ledger, seen from three places."*

**Artinya:** "Seorang buyer mau obligasi negara tenor 30 tahun, seribu unit. Dua dealer
diundang. Pasar tidak pernah tahu ini ada — instrumennya tidak, ukurannya tidak."
"Tiga kolom, tiga node participant: si buyer, dan dua dealer. Ini bukan tiga aplikasi.
Satu ledger, dilihat dari tiga tempat."

**Kenapa begini:** Kalimat kedua itu penting dan sering disalahpahami penonton. Orang
mengira kamu bikin tiga UI yang saling menyembunyikan. Yang sebenarnya: satu ledger, dan
tiap kolom membaca node yang berbeda. Kalau ini tidak lurus di awal, seluruh bukti
privasimu terbaca sebagai trik tampilan.

### 0:50–1:50 · Momen inti
**Klik:** kolom Dealer A → `Quote` → `4210000` → submit.

> *"Dealer A answers with a sealed quote. Four million two hundred and ten thousand."*

**Berhenti. Tunjuk kolom Dealer B. Tahan tiga detik penuh — jangan buru-buru.**

> *"Now Dealer B. Not a masked row. Not a commitment hash waiting to be revealed.
> **Nothing.** That quote was never transmitted to Dealer B's node."*

**Artinya:** "Sekarang Dealer B. Bukan baris yang disamarkan. Bukan commitment hash yang
menunggu dibuka. **Tidak ada apa-apa.** Quote itu tidak pernah dikirim ke node Dealer B."

**Kenapa tiga kalimat penyangkalan itu:** penonton teknis akan otomatis menebak "oh,
pasti di-hash dulu terus di-reveal" — itu cara transparent chain menyelesaikannya. Kamu
harus menutup tebakan itu sebelum muncul. *Masked row* = baris disamarkan. *Commitment
hash* = sidik jari harga yang dibuka belakangan.

> *"Jason said forty lines of Daml. Honestly, the part that does this is two. The quote
> template says `signatory dealer, buyer`, and then it says nothing else — there is no
> observer clause. The regulator's party id is written on that contract as a field, and
> the regulator still cannot see it, because being named in a contract is not the same as
> being a stakeholder in it. On a transparent chain this beat costs you a TEE, a ZK
> circuit, or an FHE scheme. Here it costs you a line you didn't write."*

**Artinya:** "Jason bilang empat puluh baris Daml. Jujurnya, bagian yang melakukan ini
cuma dua. Template quote menulis `signatory dealer, buyer`, lalu berhenti — tidak ada
klausa observer sama sekali. Party id regulator itu *tertulis* di kontrak tersebut sebagai
sebuah field, dan regulator tetap tidak bisa melihatnya, karena disebut namanya di dalam
kontrak tidak sama dengan menjadi stakeholder-nya. Di chain transparan, momen ini
membuatmu bayar TEE, sirkuit ZK, atau skema FHE. Di sini, harganya adalah satu baris yang
tidak kamu tulis."

**Kenapa ini momen terbaikmu:** kamu mengoreksi host ke arah yang membuat proyekmu terlihat
*lebih* kuat, bukan lebih lemah. Dan detail regulator itu bukti yang tidak bisa dibantah —
menunjukkan bahwa privasinya bukan soal "data disembunyikan", tapi soal siapa yang jadi
pihak dalam kontrak. Kalimat terakhir ("satu baris yang tidak kamu tulis") adalah yang akan
dikutip orang.

**Klik:** kolom Dealer B → `Quote` → `4250000` → submit.
> *"Dealer B prices blind. Neither dealer has ever seen the other's number."*

**Artinya:** "Dealer B memberi harga dalam keadaan buta. Tidak satu pun dealer pernah
melihat angka lawannya."

### 1:50–2:05 · Buka segel ke regulator — **WAJIB SEBELUM AWARD**
**Klik:** kolom buyer, di dua kartu quote → `⚖ Disclose to regulator`. Dua klik, jeda ~2 detik.

> *"Before I award — either side can reveal one sealed quote to a regulator, on demand,
> without showing it to a rival and without publishing anything."*

**Artinya:** "Sebelum aku award — pihak mana pun bisa membuka satu quote tersegel ke
regulator, kapan diminta, tanpa memperlihatkannya ke pesaing dan tanpa mempublikasikan
apa pun."

> ⚠ **Urutan ini tidak bisa ditawar.** `Award` mengarsip quote-nya, dan tombol disclose
> ikut hilang. Kalau kamu award duluan, beat best execution di menit 3:10 mati total —
> kartunya baca *"No competing asks disclosed"* dan tidak ada jalan balik di atas panggung.
> Sudah kuuji: nol tombol disclose tersisa sesudah award.

### 2:05–2:30 · Award — harga kedua, atomik
**Klik:** kolom buyer → `Award`. Tunggu banner `landed` muncul.

> *"The cheapest ask wins — Dealer A — and is paid the second price. Four million two
> hundred and fifty. Bond and cash move in one transaction: both legs or neither."*

**Artinya:** "Ask termurah menang — Dealer A — dan dibayar harga kedua. Empat juta dua
ratus lima puluh ribu. Obligasi dan uang bergerak dalam satu transaksi: dua kaki sekaligus,
atau tidak sama sekali."

**Kenapa "both legs or neither" penting:** itu istilah orang settlement. Artinya tidak ada
jendela waktu di mana satu pihak sudah menyerahkan dan pihak lain belum. Bukan fitur
sampingan — itu justru alasan meja institusi mau melihat chain sama sekali.

### 2:30–3:10 · Privacy verifier
**Klik:** sidebar → `Verify privacy`.

> *"You should not trust a demo about privacy, so this doesn't ask you to. This view opens
> a separate read against each party's node, as that party, and counts what came back.
> Each dealer's node holds its own quote and nothing else. The regulator held zero
> contracts until the trade executed."*
> *"If you have devtools open you can watch it: four reads, four different parties, four
> different answers. That is the whole claim, and it is checkable from your side of the
> screen, not mine."*

**Artinya:** "Kamu memang tidak seharusnya percaya pada demo soal privasi, jadi ini tidak
memintamu percaya. View ini membuka pembacaan terpisah ke node tiap party, *sebagai* party
itu, lalu menghitung apa yang kembali. Node tiap dealer memegang quote-nya sendiri dan
tidak ada yang lain. Regulator memegang nol kontrak sampai trade-nya eksekusi."
"Kalau devtools-mu terbuka, kamu bisa melihatnya sendiri: empat pembacaan, empat party
berbeda, empat jawaban berbeda. Itu seluruh klaimnya, dan bisa dicek dari sisi layarmu,
bukan sisiku."

**Kenapa kalimat terakhir itu senjatanya:** kamu memindahkan beban pembuktian ke penonton.
Ini juga jawaban Q4 moderator, jadi kalau kamu sudah menanamnya di sini, jawabanmu nanti
tinggal melanjutkan, bukan mengulang.

### 3:10–3:35 · Best execution tanpa order book
**Klik:** sidebar → `Best execution`.

> *"A public exchange proves best execution against a visible order book. There is no book
> here. It still proves it, from the two asks disclosed a minute ago: the winner quoted the
> lowest, and the buyer paid no worse than anyone. Confidential before the trade, auditable
> after it — and everyone says you have to pick one."*

**Artinya:** "Bursa publik membuktikan best execution dengan membandingkan ke order book
yang terlihat. Di sini tidak ada order book. Tetap terbukti, dari dua ask yang dibuka
semenit lalu: pemenangnya memang menawar paling rendah, dan buyer tidak membayar lebih
buruk dari siapa pun. Rahasia sebelum trade, bisa diaudit sesudahnya — padahal semua orang
bilang kamu harus memilih salah satu."

**Istilah:** *best execution* = kewajiban regulatoris membuktikan nasabah dapat harga
terbaik yang wajar. Ini bahasa compliance, bukan bahasa crypto — dan itulah kenapa kalimat
ini yang paling menempel di telinga orang institusi.

### 3:35–4:00 · Tutup, serahkan balik
> *"That's the mechanism. Fifty settled trades on Devnet behind it, cash legs in real
> Canton Coin and in BitSafe's CBTC through registries I don't control, and it shipped as a
> package upgrade rather than a redeploy — the validator is running version 0.1 through 0.5
> side by side. Jason, over to you."*

**Artinya:** "Itu mekanismenya. Di belakangnya ada lima puluh trade yang sudah settle di
Devnet, kaki uangnya pakai Canton Coin asli dan CBTC-nya BitSafe lewat registry yang bukan
aku yang kendalikan, dan ini dirilis sebagai upgrade paket, bukan deploy ulang — validator
menjalankan versi 0.1 sampai 0.5 berdampingan. Jason, kembali ke kamu."

**Jangan pakai slot ini buat minta design partner.** Kamu punya 30 detik khusus di 0:58.

---

## Empat pertanyaan moderator — pahami argumennya, bukan hafal kalimatnya

### Q1 — "Kenapa model signatory-and-observer menangani ini secara native?"

**Inti yang harus kamu sampaikan:** di chain transparan, privasi adalah sesuatu yang kamu
*tambahkan di atas* ledger yang sudah terlanjur menyiarkan segalanya. Enkripsi, ZK, atau
hardware yang harus dipercaya — ketiganya adalah mesin untuk **menyembunyikan data dari
orang yang sudah menerimanya**. Canton tidak pernah mengirimnya. Kontrak pergi ke
stakeholder-nya saja, dan stakeholder dideklarasikan di template.

**Kalimat kunci yang harus keluar:** *"There is no third party to hide from, so there is
nothing to encrypt."* — "Tidak ada pihak ketiga untuk disembunyikan, jadi tidak ada yang
perlu dienkripsi."

**Penutup yang jujur:** empat puluh baris itu bukan harga privasinya — privasinya justru
*ketiadaan* satu baris. Empat puluh baris itu harga **mekanismenya**: escrow, harga kedua,
jalur disclosure.

### Q2 — "Kenapa mengunci jaminan dealer di escrow saat quote?"

**Inti:** indikasi harga itu gratis, dan apa pun yang gratis akan disalahgunakan di lelang
tersegel. Kalau memberi quote tidak ada ongkosnya, strategi menangnya adalah menawar agresif
di mana-mana lalu memutuskan belakangan apakah mau ditepati — dan justru perilaku itu yang
bikin meja institusi tidak percaya RFQ elektronik lalu balik ke telepon.

Di sini, mengirim quote **memindahkan obligasi si dealer ke escrow**. Harganya dijamin aset
sebelum buyer melihatnya. Jadi buyer tidak pernah meng-award ke gertakan, dan dealer tidak
pernah ditinggal memegang lawan yang berubah pikiran.

**Bonus yang bagus disebut:** spam quote jadi membatasi diri sendiri — inventarismu
terbatas, jadi jumlah quote hidup yang bisa kamu pegang juga terbatas.

**Istilah:** *escrow* = titipan terkunci. *bluff* = gertakan.

### Q3 — "Kenapa harga kedua, bukan harga penawar pemenang sendiri?"

**Inti:** di *first price*, strategi terbaikmu adalah **tidak pernah** menawar di level
sebenarnya — kamu menaikkan sedikit (*shading*), dan seberapa banyak tergantung menebak
dealer lain. Tebak-tebakan itulah tempat permainan informasi hidup.

Di *second price*, pemenang dibayar angka runner-up. Jadi menaikkan harga cuma bikin kamu
kehilangan deal tanpa pernah menambah margin. Menawar jujur jadi strategi yang paling
menguntungkan, bukan sekadar strategi yang naif.

**Lalu — dan ini bagian terpentingnya — akui bugmu sendiri:**

> *"Awarding a one-quote auction used to fall back to the winner's own ask — first price
> wearing a Vickrey label, chosen after the buyer had seen every sealed number. That's now
> rejected outright, with a regression test named after it."*

**Artinya:** "Dulu, meng-award lelang berisi satu quote jatuh balik ke ask si pemenang
sendiri — first price yang memakai label Vickrey, dipilih setelah buyer melihat semua angka
tersegel. Sekarang itu ditolak mentah, dengan regression test yang dinamai persis seperti
bugnya."

**Kenapa harus kamu sebut:** mengakui bug terburuk yang kamu temukan sendiri, di panggung
publik, menjual keinsinyuranmu lebih keras daripada klaim apa pun. Orang yang pernah
membangun sistem uang akan langsung mengenali kelasnya — dan Ales termasuk orang itu.

### Q4 — "Bagaimana verifier dipakai meyakinkan institusi yang skeptis?"

**Inti:** jangan minta mereka percaya, dan jangan demokan *ke* mereka — **suruh mereka yang
menjalankan.** Halaman yang kamu hosting adalah bukti paling lemah, karena servernya kamu
yang pegang. Jadi artefaknya adalah repo: `npm run demo` mem-boot sandbox Canton, mengisinya,
dan menyajikan desk di mesin mereka dalam ~2 menit.

**Kalimat penutup:** *"You have a validator — allocate one party, vet one DAR, and check it
yourself."* — "Kamu punya validator: alokasikan satu party, vetting satu DAR, cek sendiri."

**Kalau ditanya lanjutan "gimana membuktikan isi node tanpa membuka isinya":** jawab presisi
— kamu **tidak** membuktikan isinya, kamu membuktikan **ketiadaan**, dan itu justru klaim
yang penting. Sebut batasnya sendiri: pembacaan itu lewat API node-mu, jadi ini meyakinkan
buat orang yang membaca network tab, bukan buat verifier formal. Kalau mau lebih kuat,
mereka yang menjalankan participant-nya.

---

## Group discussion (0:42–0:55) — inti tiap jawaban

Enam pertanyaan, ~2 menit masing-masing. **Jangan ambil semua.** Tiga jawaban bagus lebih
baik daripada enam yang tipis. Yang paling kuat buatmu: **Q5 dan Q6.**

- **Q1 privasi sebagai ekonomi** — privasi bukan pembungkus compliance di atas produk,
  privasi **adalah** produknya. Hilangkan kebutaan dealer, lelang harga-kedua langsung
  berhenti bekerja karena semua orang bisa melihat lapangan.
- **Q2 kalau semuanya terlihat global** — mekanismenya yang rusak duluan. Sealed quote harus
  dibangun ulang jadi commit-reveal, dan commit-reveal membocorkan *waktu* serta membiarkan
  dealer sekadar tidak membuka. Tiap versi perbaikannya lebih buruk dari yang diganti. Sebut
  bahwa kamu sudah membangun produk ini empat kali di chain transparan.
- **Q3 menyusun dengan infrastruktur orang lain** — tiga luka nyata: choice context registry
  itu *round-scoped* (retry harus fetch ulang, bukan replay — replay muncul sebagai
  `UNKNOWN_CONTRACT_SYNCHRONIZERS` dan terbaca persis seperti bug sendiri); transfer ke
  penerima tanpa pre-approval itu dua fase; dan venue fee-mu **tidak bisa** dipungut di rail
  registry karena settle-nya lewat alokasi issuer, bukan memecah holding yang kamu pegang.
  Sebut yang ketiga duluan sebelum ada yang menemukannya.
- **Q4 dari hackathon ke produksi** — jujur: yang kurang adalah design partner. Kodenya lebih
  maju daripada buktinya. Sesudah itu: cerita kustodi yang bukan kuncimu sendiri, dan fee
  yang jalan di rail registry.
- **Q5 asumsi yang tidak selamat** — dua. Kamu kira bisa merekonstruksi perilaku dealer dari
  riwayat ledger; `/v2/updates/flats` memberi pipa hidup tapi **nol event historis** di enam
  bentuk request, jadi kamu berhenti butuh riwayat dan membuat award **menulis** catatannya.
  Dan kamu kira pembacaan ACS wildcard akan jalan begitu saja; node membatasi di 200 elemen,
  buyer-mu lewat batas, dan satu kolom penuh di desk hosted padam. **Dua-duanya tidak ada di
  tutorial mana pun** — itu kalimat penutupnya.
- **Q6 yang hilang dari ekosistem** — developer experience di sisi *baca*. Replay event
  historis yang benar-benar mengembalikan event, pembacaan ACS yang mem-paging alih-alih
  menolak di 200, dan satu library bersama untuk alur allocation Token Standard. Tutup dengan:
  *"I hand-rolled the two-phase transfer and the choice-context refetch, and so has everyone
  else on this call. That's a library somebody should just write."* — "Aku menulis sendiri
  transfer dua fase dan refetch choice-context, dan semua orang di call ini juga. Itu library
  yang seharusnya tinggal ditulis seseorang."

  **Ini jawaban yang Ales bilang secara eksplisit ingin dia dengar.** Jangan lewatkan Q6.

---

## Slot 30 detik (0:58) — tempel di kertas

> *"One introduction: a desk, a dealer, or a fund administrator that runs block enquiries
> over chat today, and will put ten of them through this and tell me where it breaks. Not a
> contract — ten enquiries. I've written down in advance the point where I stop: if they go
> quiet for two weeks, or if the privacy verifier ever shows a quote visible to a rival, the
> pilot ends there."*
>
> *"And second — if you're building on the Canton Token Standard, I'm a second implementation
> you can test your registry against. Being that has already found two DX problems in other
> people's registries. hudapugar@gmail.com."*

**Artinya:** "Satu perkenalan: sebuah meja, dealer, atau fund administrator yang hari ini
menjalankan enquiry blok lewat chat, dan mau memasukkan sepuluh di antaranya ke sini lalu
memberitahuku di mana ini patah. Bukan kontrak — sepuluh enquiry. Aku sudah menuliskan di
muka titik di mana aku berhenti: kalau mereka diam dua minggu, atau kalau privacy verifier
sampai pernah menunjukkan satu quote terlihat oleh pesaing, pilot-nya selesai di situ."

"Dan kedua — kalau kamu sedang membangun di atas Canton Token Standard, aku adalah
implementasi kedua yang bisa kamu pakai menguji registry-mu. Menjadi itu sudah menemukan dua
masalah DX di registry orang lain."

**Kenapa kill criteria disebut:** menyebut kapan kamu akan berhenti membuatmu terdengar
seperti orang yang mengelola risiko, bukan orang yang sedang jualan. Ty sudah bereaksi
positif ke ini di DM — logikanya sama di ruangan penuh orang.

---

## Kata-kata yang gampang keseleo waktu gugup

| Kata | Cara aman | Artinya |
|---|---|---|
| *signatory* | SIG-nə-tor-i | pihak yang menandatangani kontrak — penentu siapa menerima kontraknya |
| *observer* | əb-ZER-vər | pihak yang boleh melihat tapi tidak menandatangani |
| *Vickrey* | VIK-ree | lelang tersegel harga-kedua |
| *escrow* | ES-kro | titipan terkunci |
| *attestation* | a-tes-TAY-shən | pernyataan terverifikasi (di sini: bukti best execution) |
| *basis points / bps* | "bips" | 1 bps = 0,01% |
| *delivery-versus-payment / DvP* | eja huruf: dee-vee-pee | barang dan uang berpindah bersamaan |
| *participant node* | — | node peserta; **kalimat andalanmu**, jangan tertukar dengan "validator" |

**Kalau blank di tengah kalimat:** berhenti, tunjuk layar, dan bilang
*"— look at Dealer B's column."* Layarnya yang berbicara. Diam sambil menunjuk jauh lebih
baik daripada mengisi dengan kata-kata yang tidak kamu maksud.

**Kalau ada yang bertanya dan kamu tidak paham pertanyaannya:** *"Can you say that again — do
you mean X or Y?"* Meminta pengulangan itu normal di call teknis dan jauh lebih aman daripada
menjawab pertanyaan yang salah selama dua menit.
