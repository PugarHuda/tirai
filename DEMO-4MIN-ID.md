# Tirai — 4 menit, versi paham dulu

*(Formatnya slide, bukan demo live — validator sandbox 5N merotasi client key dan Umbra
kena hal yang sama. Deck: `deck/office-hours.html`.)*

Kamu tetap **ngomong bahasa Inggris** di sesi itu. File ini bukan pengganti
`DEMO-4MIN.md`, tapi supaya kamu tahu *apa* yang kamu ucapkan dan kenapa — jadi kalau
pertanyaannya datang beda dari yang ditulis, kamu bisa nyusun sendiri, bukan lupa naskah.

Pola tiap slide: *kalimat Inggris yang kamu baca* → **arti** → **kenapa kalimat itu**.

---

## Sebelas slide, 4 menit

Deck-nya `deck/office-hours.html` — panah kiri/kanan untuk maju, `f` untuk layar penuh.
Cadangan: `deck/tirai-office-hours.pdf`, isi sama.

**Semua screenshot di deck ini diambil dari desk asli yang jalan di node Canton hidup**,
bukan mockup. Itu penting kalau ada yang bertanya: kamu bisa jawab bahwa gambarnya foto,
bukan gambaran.

### Cara maju: panah kanan menyusuri kotak dulu, baru pindah slide

Lima slide menyorot screenshot-nya **satu kotak setiap kali kamu tekan panah kanan** —
jadi gambar diam bisa diceritakan urut sesuai kalimatmu. Panah kanan baru pindah slide
setelah semua kotak di slide itu muncul. Panah kiri mundur, dan mendarat di slide
sebelumnya dengan semua kotaknya sudah tampil.

| Slide | Kotaknya | Tekan berapa kali untuk pindah |
|---|---|---|
| 4 · momen inti | A menyegel 4.210.000 → node B, tidak ada apa-apa | 3 |
| 6 · escrow & bug | obligasinya ditahan → satu quote, ditolak | 3 |
| 7 · verifier | Dealer A → Dealer B → regulator | 4 |
| 8 · best execution | vonisnya → baris pemenang | 3 |
| 9 · catatan panel | jarak dalam bps → diam pun terlihat | 3 |

Slide lain cukup sekali tekan. Kalau kehilangan tempat, `Home` balik ke slide 1, dan
angka di pojok selalu nomor slide, bukan nomor kotak.

**Ini penting dilatih sekali sebelum naik**: kalau kamu tidak tahu ada tahapannya, kamu
akan mengira deck-nya macet waktu menekan panah dan slide-nya tidak berganti.

Versi PDF menampilkan semua kotak sekaligus — tidak ada tombol untuk ditekan di kertas.

### Slide 1 · sampul · 0:00–0:20
> *"Thanks Jason. I'm going to skip straight to the thing a screenshot normally can't
> show you — a dealer's node **not** receiving something. These are screenshots off a live
> Canton node rather than a live desk, because the 5N sandbox validator rotated its client
> keys last week and, like Samuel, I lost access. Same event, not two problems."*

**Artinya:** "Makasih Jason. Aku langsung ke hal yang biasanya tidak bisa ditunjukkan
screenshot — node seorang dealer yang *tidak menerima* sesuatu. Ini screenshot dari node
Canton hidup, bukan desk hidup, karena validator sandbox 5N merotasi client key-nya minggu
lalu dan, seperti Samuel, aku kehilangan akses. Satu peristiwa yang sama, bukan dua
masalah."

**Kenapa begini:** Samuel sudah bilang hal yang sama sebelum kamu, ke Jason dan ke Ales.
Dengan menyebutnya sebagai *satu* peristiwa, kamu berhenti terdengar seperti orang yang
proyeknya rusak dan mulai terdengar seperti orang yang tahu persis kenapa. Dan kamu
membela Samuel sekaligus, yang akan dia sadari.

### Slide 2 · masalahnya · 0:20–0:45
> *"An institution wants to move a block of bonds. Before it can trade, it has to ask
> several dealers what they'd pay. And the moment anyone sees you asking, they know your
> size and your direction — so the price moves against you before you trade. Which is why
> block trading in 2026 still happens on the telephone."*

**Artinya:** "Sebuah institusi mau memindahkan satu blok obligasi. Sebelum bisa trade, dia
harus bertanya ke beberapa dealer berapa mereka mau bayar. Dan begitu ada yang melihat kamu
bertanya, mereka tahu ukuranmu dan arahmu — jadi harganya bergerak melawanmu sebelum kamu
sempat trade. Itulah kenapa block trading di tahun 2026 masih terjadi lewat telepon."

**Kenapa kalimat terakhir:** itu bukan lelucon, itu argumen pasar. Kalau produkmu tidak
lebih baik dari telepon, tidak ada gunanya. Menyebut telepon membuat pesaingmu jelas.

### Slide 3 · mekanismenya · 0:45–1:10
> *"Four steps. The buyer invites a panel it chooses. Each dealer answers sealed, and
> quoting moves that dealer's bond into escrow — a price is a commitment, not a bluff. The
> cheapest ask wins and is paid the second-cheapest price. Bond and cash then move in one
> transaction: both legs, or neither."*

**Artinya:** "Empat langkah. Buyer mengundang panel yang dia pilih sendiri. Tiap dealer
menjawab tersegel, dan memberi quote memindahkan obligasi dealer itu ke escrow — harga
adalah komitmen, bukan gertakan. Ask termurah menang dan dibayar harga termurah kedua.
Obligasi dan uang lalu bergerak dalam satu transaksi: dua kaki sekaligus, atau tidak sama
sekali."

### Slide 4 · MOMEN INTI · 1:10–1:50
**Diam tiga detik penuh sesudah slide ini muncul. Biarkan mereka membaca.** Ini satu-satunya
slide yang akan mereka ingat besok.

> *"Two dealers, same auction, same moment. On the left, Dealer A has sealed four million
> two hundred and ten thousand. On the right is Dealer B's own session, reading Dealer B's
> own participant node."*
>
> *"Not a masked row. Not a commitment hash waiting to be revealed. Nothing. And that line
> in Dealer B's column is the product telling you why: rival dealers' quotes are never sent
> to your node."*

**Artinya:** "Dua dealer, lelang yang sama, saat yang sama. Di kiri, Dealer A sudah
menyegel empat juta dua ratus sepuluh ribu. Di kanan, sesi milik Dealer B sendiri, membaca
node participant milik Dealer B sendiri."
"Bukan baris yang disamarkan. Bukan commitment hash yang menunggu dibuka. Tidak ada
apa-apa. Dan kalimat di kolom Dealer B itu adalah produknya sendiri yang menjelaskan
kenapa: quote dealer pesaing tidak pernah dikirim ke node-mu."

**Kenapa tiga penyangkalan itu:** penonton teknis akan otomatis menebak "pasti di-hash
lalu di-reveal" — begitulah transparent chain menyelesaikannya. Kamu harus menutup tebakan
itu sebelum sempat muncul. Dan kalimat terakhir bagus karena bukan *kamu* yang mengklaim —
produknya yang menulis itu di layar, dan mereka bisa membacanya sendiri.

### Slide 5 · dua barisnya · 1:50–2:35
> *"Jason said about forty lines of Daml. Honestly, the part that does this is two. The
> quote template declares `signatory dealer, buyer`, and then it stops — there's no
> observer clause at all."*
>
> *"Look at the regulator. Its party id is written on that contract as a field, and the
> regulator still cannot see it — because being named in a contract isn't the same as being
> a stakeholder in it. On a transparent chain this costs you a TEE, a ZK circuit, or an FHE
> scheme. Here there's no third party to hide from, so there's nothing to encrypt. I've
> built this product four times on transparent chains; every time, the cryptography was
> most of the work."*

**Artinya:** "Jason bilang sekitar empat puluh baris Daml. Jujurnya, bagian yang melakukan
ini cuma dua. Template quote mendeklarasikan `signatory dealer, buyer`, lalu berhenti —
tidak ada klausa observer sama sekali."
"Lihat regulatornya. Party id-nya tertulis di kontrak itu sebagai sebuah field, dan
regulator tetap tidak bisa melihatnya — karena disebut namanya di dalam kontrak tidak sama
dengan menjadi stakeholder-nya. Di chain transparan ini membuatmu bayar TEE, sirkuit ZK,
atau skema FHE. Di sini tidak ada pihak ketiga untuk disembunyikan, jadi tidak ada yang
perlu dienkripsi. Aku sudah membangun produk ini empat kali di chain transparan; tiap kali,
kriptografinya yang menghabiskan sebagian besar pekerjaan."

**Ini momen terbaikmu di seluruh sesi.** Kamu mengoreksi host ke arah yang membuat proyekmu
terdengar lebih kuat. Jangan buru-buru — beri jeda sesudah "the part that does this is two."

### Slide 6 · escrow, dan bugnya · 2:35–3:00
> *"Quoting locks the dealer's bond in escrow, so the buyer never awards into a bluff. And
> on the right — this is the worst bug I've shipped. With one quote there's no second price,
> and awarding used to fall back to the winner's own ask. First price wearing a Vickrey
> label, chosen after the buyer had seen every sealed number. The ledger refuses it outright
> now, and the regression test is named after the bug."*

**Artinya:** "Memberi quote mengunci obligasi dealer di escrow, jadi buyer tidak pernah
meng-award ke gertakan. Dan di kanan — ini bug terburuk yang pernah kukirim. Dengan satu
quote tidak ada harga kedua, dan meng-award dulu jatuh balik ke ask si pemenang sendiri.
First price yang memakai label Vickrey, dipilih *sesudah* buyer melihat semua angka
tersegel. Ledger menolaknya mentah sekarang, dan regression test-nya dinamai persis seperti
bugnya."

**Kenapa mengaku bug di depan umum:** orang yang pernah membangun sistem uang akan langsung
mengenali kelas bug itu, dan Ales termasuk. Mengakuinya duluan menjual keinsinyuranmu jauh
lebih keras daripada klaim apa pun. Ini juga jawaban Q3 moderator, jadi kalau sudah kamu
tanam di sini, jawabanmu nanti tinggal melanjutkan.

### Slide 7 · verifier · 3:00–3:20
> *"You shouldn't trust a demo about privacy. This view opens one read per party, addressed
> to that party's node, and counts what came back. Four reads, four parties, four different
> answers — checkable in your own devtools, from your side of the screen."*

**Artinya:** "Kamu memang tidak seharusnya percaya pada demo soal privasi. View ini membuka
satu pembacaan per party, dialamatkan ke node party itu, lalu menghitung apa yang kembali.
Empat pembacaan, empat party, empat jawaban berbeda — bisa dicek di devtools-mu sendiri,
dari sisi layarmu."

**Kenapa "from your side of the screen" penting:** kamu memindahkan beban pembuktian ke
penonton. Itu inti seluruh posisimu, dan itu juga jawaban Q4 moderator.

### Slide 8 · best execution · 3:20–3:35
> *"A public exchange proves best execution against a visible order book. There's no book
> here, and it still proves it — from the sealed asks either side chose to reveal to the
> regulator. Confidential before the trade, auditable after it. Everyone says you have to
> pick one."*

**Artinya:** "Bursa publik membuktikan best execution dengan membandingkan ke order book
yang terlihat. Di sini tidak ada order book, dan tetap terbukti — dari ask tersegel yang
salah satu pihak pilih untuk dibuka ke regulator. Rahasia sebelum trade, bisa diaudit
sesudahnya. Semua orang bilang kamu harus memilih salah satu."

**Istilah:** *best execution* = kewajiban regulatoris membuktikan nasabah dapat harga
terbaik yang wajar. Ini bahasa compliance, dan justru itu yang menempel di telinga orang
institusi.

### Slide 9 · jawaban soal front-running · 3:35–3:50
> *"A judge asked me this at the grand final. An invited dealer does see the enquiry, and no
> ledger stops that. What changed is that every award now writes a record: who was invited,
> who answered, and how far each ask was from the winner's — in basis points, never the ask
> itself. A losing price stays unrevealed even in the buyer's own record."*

**Artinya:** "Seorang juri menanyakan ini di grand final. Dealer yang diundang memang
melihat enquiry-nya, dan tidak ada ledger yang bisa mencegah itu. Yang berubah: tiap award
sekarang menulis satu catatan — siapa diundang, siapa menjawab, dan seberapa jauh tiap ask
dari ask pemenang — dalam basis point, bukan ask-nya. Harga yang kalah tetap tak terungkap
bahkan di catatan buyer sendiri."

**Kenapa mengulang pertanyaan juri:** menunjukkan kamu tidak berhenti sesudah menang.
Itu persis yang Ales bilang ingin dia lihat dari builder pasca-hackathon.

### Slide 10–11 · status, lalu serahkan balik · 3:50–4:00
> *"Fifty settled trades on Devnet, cash legs in real Canton Coin and BitSafe's CBTC through
> registries I don't control, shipped as a package upgrade rather than a redeploy. What I
> won't claim: no design partner, no revenue, and the fee doesn't work on a registry rail.
> Jason, over to you."*

**Artinya:** "Lima puluh trade settled di Devnet, kaki uangnya pakai Canton Coin asli dan
CBTC-nya BitSafe lewat registry yang bukan aku yang kendalikan, dirilis sebagai upgrade
paket bukan deploy ulang. Yang tidak akan kuklaim: belum ada design partner, belum ada
pendapatan, dan fee-nya tidak jalan di rail registry. Jason, kembali ke kamu."

**JANGAN sampaikan permintaan design partner di sini.** Kamu punya 30 detik khusus di 0:58.

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
