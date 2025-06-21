import { AppModel } from "../models/AppModel.js";

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
            return res.redirect('/');
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Error approving users"
            });
        }
    }
}