import { Octokit } from "@octokit/rest";
import { config } from 'dotenv';
config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const ORG_NAME = process.env.ORG_NAME

// Get GitHub user ID from username
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