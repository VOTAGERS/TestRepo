# Rangkuman Perubahan Mekanisme OAuth - Penambahan ke NetUserDetail

## Tujuan
Mengimplementasikan mekanisme penyimpanan data pengguna dari GitHub ke dalam collection Firestore bernama `NetUserDetail` untuk mengoptimalkan penggunaan API dan menyimpan informasi profil lengkap pengguna.

## Perubahan Utama
1. **Penambahan fungsi `getGithubUserData`** - Mengambil data pengguna dari GitHub API dan menyimpannya ke collection `NetUserDetail` di Firestore
2. **Implementasi caching otomatis** - Jika data pengguna belum ada di `NetUserDetail`, maka sistem akan mengambil dari GitHub API dan menyimpannya
3. **Pembaruan fungsi `saveGithubProfileToNetUserDetail`** - Menyimpan profil GitHub ke collection `NetUserDetail`
4. **Pembaruan strategi Passport** - Menambahkan pengambilan dan penyimpanan profil GitHub sebelum proses otentikasi selesai
5. **Pembaruan controller AuthMiddleware** - Menggunakan data dari `NetUserDetail` untuk ditampilkan di view

## Manfaat
- **Efisiensi API** - Mengurangi jumlah permintaan ke GitHub API karena data disimpan lokal di Firestore
- **Penyimpanan profil lengkap** - Menyimpan lebih banyak informasi profil GitHub pengguna seperti nama lengkap, email, bio, lokasi, perusahaan, dll
- **Kecepatan akses** - Data profil bisa diambil langsung dari Firestore tanpa harus mengakses API eksternal
- **Offline capability** - Data profil masih bisa diakses meskipun terjadi kendala koneksi ke GitHub API

## Alur Kerja Baru
1. Pengguna login melalui GitHub
2. Sistem memeriksa apakah data pengguna sudah ada di collection `NetUserDetail`
3. Jika belum ada, data diambil dari GitHub API dan disimpan ke `NetUserDetail`
4. Jika sudah ada, data diambil dari Firestore (menghindari permintaan API)
5. Data digunakan untuk proses otentikasi dan ditampilkan di tampilan dashboard

## File-file yang dimodifikasi
- `services/githubService.js` - Menambahkan fungsi `getGithubUserData` dan `saveGithubProfileToNetUserDetail`
- `middleware/sessionMiddleware.js` - Pembaruan strategi Passport untuk menyimpan profil ke `NetUserDetail`
- `controllers/OAuthController.js` - Pembaruan fungsi-fungsi untuk mengambil data dari `NetUserDetail`