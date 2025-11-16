import { Octokit } from "@octokit/rest";
import { config } from 'dotenv';
import { passport } from '../middleware/sessionMiddleware.js';
import { db } from './firebaseService.js'; // Import database Firestore
config();

const octokit = new Octokit({ auth: process.env.ACC_TOKEN })
const ORG_NAME = process.env.ORGS_NAME

// === FUNGSI GITHUB API ===
export async function getGithubUserData(username) {
  try {
    // Cek dulu apakah data sudah ada di collection NetUserDetail
    const userDoc = await db.collection("NetUserDetail").doc(username.toLowerCase()).get();
    if (userDoc.exists) {
      // Gunakan data yang sudah ada di database
      const userData = userDoc.data();
      console.log(`Data user ${username} diambil dari database.`);
      return {
        id: userData.id,
        username: userData.username
      };
    }

    // Jika belum ada di database, panggil API GitHub
    console.log(`Data user ${username} tidak ditemukan di database. Mengambil dari GitHub API...`);
    const { data } = await octokit.users.getByUsername({ username });

    // Simpan data ke collection NetUserDetail untuk digunakan di masa mendatang
    await db.collection("NetUserDetail").doc(data.login.toLowerCase()).set({
      id: data.id,
      username: data.login.toLowerCase(),
      name: data.name || null,
      email: data.email || null,
      avatar_url: data.avatar_url || null,
      bio: data.bio || null,
      location: data.location || null,
      company: data.company || null,
      blog: data.blog || null,
      public_repos: data.public_repos || 0,
      followers: data.followers || 0,
      following: data.following || 0,
      created_at: data.created_at || null,
      updated_at: data.updated_at || null,
      DateCreated: new Date()
    }, { merge: true }); // Gunakan merge agar tidak menimpa data yang sudah ada

    console.log(`Data user ${username} disimpan ke database.`);
    return {
      id: data.id,
      username: data.login.toLowerCase()
    };
  } catch (error) {
    console.error('Gagal mendapatkan user data:', error.message);
    return null;
  }
}

// Invite user ke organisasi GitHub
export async function inviteUserToOrg(username) {
  const user = await getGithubUserData(username);
  if (!user) return { success: false, message: 'User GitHub tidak ditemukan.' };

  try {
    await octokit.rest.orgs.createInvitation({
      org: ORG_NAME,
      invitee_id: user.id,
      role: 'direct_member'
    });
    return { success: true };
  } catch (error) {
    console.error('Gagal invite user ke organisasi:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
}

// Fungsi untuk menyimpan data profil GitHub ke NetUserDetail sebelum login
export async function saveGithubProfileToNetUserDetail(profile) {
  try {
    // Pastikan data profil ada sebelum menyimpan
    if (!profile || !profile.username) {
      console.error('Profile tidak valid untuk disimpan ke NetUserDetail');
      return null;
    }

    // Ambil data profil dari GitHub (jika belum disediakan dalam profile)
    const githubUsername = profile.username;
    const githubUserData = await getGithubUserData(githubUsername); // Ini akan menyimpan jika belum ada

    // Sebagai langkah tambahan, kita bisa menyimpan info lebih lengkap langsung dari profile
    // karena passport sudah menyediakan sebagian data
    await db.collection("NetUserDetail").doc(githubUsername.toLowerCase()).set({
      id: profile.id,
      username: profile.username.toLowerCase(),
      name: profile.displayName || null,
      email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
      avatar_url: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      profile_url: profile.profileUrl || null,
      DateUpdated: new Date()
    }, { merge: true }); // Gunakan merge agar tidak menimpa data yang sudah ada

    console.log(`Profil GitHub untuk ${githubUsername} diperbarui di NetUserDetail.`);
  } catch (error) {
    console.error('Gagal menyimpan profil GitHub ke NetUserDetail:', error.message);
  }
}

// Fungsi untuk mendapatkan data profil lengkap dari NetUserDetail
export async function getGithubUserDetailFromDB(username) {
  try {
    const userDoc = await db.collection("NetUserDetail").doc(username.toLowerCase()).get();

    if (userDoc.exists) {
      console.log(`Data user ${username} diambil dari NetUserDetail.`);
      return userDoc.data();
    } else {
      console.log(`Data user ${username} tidak ditemukan di NetUserDetail.`);
      return null;
    }
  } catch (error) {
    console.error('Gagal mendapatkan user detail dari NetUserDetail:', error.message);
    return null;
  }
}

export async function handleGithubCallback(req, res, next) {
  passport.authenticate('github', async (err, user, info) => {
    if (err) {
      console.error("GitHub OAuth authentication error:", err);
      return next(err); // Biarkan Express menangani error
    }

    if (!user) {
      const errorMessage = info.message || 'Akun Anda belum terdaftar di platform kami.';
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Error destroying session after failed GitHub auth:", destroyErr);
        }
        res.clearCookie('connect.sid', { path: '/' });
        res.cookie('oauth_error', errorMessage, {
          maxAge: 10 * 1000,
          httpOnly: false,
          path: '/'
        });
        console.log(`🔴 User not found in Firebase. ${errorMessage} Session destroyed & cookie cleared. Redirecting to /session.`);
        return res.redirect('/session');
      });
      return;
    }

    // === SIMPAN PROFIL GITHUB KE NETUSERDETAIL SEBELUM LOGIN ===
    // Ambil data profil lengkap dari GitHub dan simpan ke NetUserDetail
    await getGithubUserData(user.githubUsername || user.GithubUserName);

    // === USER VALID, LANJUTKAN LOGIN ===
    req.logIn(user, function (err) {
      if (err) {
        console.error("Error logging in user:", err);
        return next(err);
      }
      req.session.save(() => {
        console.log('🟢 User successfully logged in. Redirecting to /workspace.');
        return res.redirect('/workspace');
      });
    });
  })(req, res, next);
}