import { AppModel } from "../models/AppModel.js";
import { getGithubUserData } from '../services/githubService.js';

export class AppController {
    static async Index(req, res) {
        try {
            res.render('index', {
                title: 'VOTAGERS',
            })
        } catch (error) {
            console.error('Error rendering index:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    static async Register(req, res) {
        try {
            const { name, githubUsername, email, stack } = req.body;
            const newUser = await AppModel.registUser({ name, githubUsername, email, stack });
            req.flash('success', 'Pendaftaran berhasil!');
            return res.redirect('/');
        } catch (error) {
            req.flash('error', 'Terjadi kesalahan saat mendaftar.');
            return res.redirect('/');
        }
    }
    // show pending user
    static async PendingUserList(req, res) {
        try {
            const { pageCursor } = req.query;
            const lastDate = pageCursor ? new Date(pageCursor) : null;
            const { users, lastCursor } = await AppModel.pendingUser(lastDate);
            res.render('userpending', { users, nextPageCursor: lastCursor ? lastCursor.toISOString() : null });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Error fetching users"
            });
        }
    }
    // approve
    static async Approve(req, res) {
        try {
            const { id } = req.params;
            const result = await AppModel.approveUser(id);
            if (!result.success) return res.status(400).send(result.message);
            return res.redirect('/workspace');
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Error approving users"
            });
        }
    }
    // github user check
    static async GithubUserCheck(req, res) {
        const { username } = req.body;
        if (!username) return res.status(400).json({ success: false, message: 'Username tidak boleh kosong' });
        try {
            const result = await getGithubUserData(username);
            if (!result) return res.status(404).json({ success: false, message: `Username ${username} tidak ditemukan.` });
            return res.status(200).json({
                success: true,
                message: `Username ${username} ditemukan.`,
                data: {
                    id: result.id,
                    username: result.username
                }
            });
        } catch (error) {
            console.error('Error saat cek user GitHub:', error.message);
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memeriksa user.' });
        }
    }
}