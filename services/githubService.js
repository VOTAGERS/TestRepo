import { Octokit } from "@octokit/rest";
import { config } from 'dotenv';
import { passport } from '../middleware/sessionMiddleware.js';
config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const ORG_NAME = process.env.GITHUB_ORG

// === FUNGSI GITHUB API ===
export async function getGithubUserData(username) {
  try {
    const { data } = await octokit.users.getByUsername({ username })
    return {
      id: data.id,
      username: data.login.toLowerCase()
    };
  } catch (error) {
    console.error('Gagal mendapatkan user data:', error.message)
    return null
  }
}

// Invite user ke organisasi GitHub
export async function inviteUserToOrg(username) {
  const user = await getGithubUserData(username)
  if (!user) return { success: false, message: 'User GitHub tidak ditemukan.' }

  try {
    await octokit.rest.orgs.createInvitation({
      org: ORG_NAME,
      invitee_id: user.id,
      role: 'direct_member'
    })
    return { success: true }
  } catch (error) {
    console.error('Gagal invite user ke organisasi:', error.response?.data || error.message)
    return { success: false, message: error.message }
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