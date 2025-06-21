import { Octokit } from "@octokit/rest";
import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import { db } from './firebaseService.js';
import { config } from 'dotenv';
config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const ORG_NAME = process.env.ORG_NAME

// === FUNGSI GITHUB API ===
export async function getGithubUserId(username) {
    try {
        const { data } = await octokit.users.getByUsername({ username })
        return data.id
    } catch (error) {
        console.error('Gagal mendapatkan user ID:', error.message)
        return null
    }
}

// Invite user ke organisasi GitHub
export async function inviteUserToOrg(username) {
  const userId = await getGithubUserId(username)
  if (!userId) return { success: false, message: 'User GitHub tidak ditemukan.' }

  try {
    await octokit.rest.orgs.createInvitation({
      org: ORG_NAME,
      invitee_id: userId,
      role: 'direct_member'
    })
    return { success: true }
  } catch (error) {
    console.error('Gagal invite user ke organisasi:', error.response?.data || error.message)
    return { success: false, message: error.message }
  }
}

// === PASSPORT STRATEGY SETUP ===
passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    name: user.PersonalName,
    email: user.email,
    githubUsername: user.GithubUserName
  });
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const githubUsername = profile.username;
    // Cek apakah user ada di database kamu
    const snapshot = await db.collection("CommunityUsers")
      .where("GithubUserName", "==", githubUsername).limit(1).get();

    if (snapshot.empty) {
      return done(null, false, { message: "User belum terdaftar di platform" });
    }
    const userData = snapshot.docs[0].data();
    return done(null, {
      id: snapshot.docs[0].id,
      ...userData
    });

  } catch (error) {
    console.error("GitHub OAuth error:", error.message);
    return done(error, null);
  }
}));
export default passport;