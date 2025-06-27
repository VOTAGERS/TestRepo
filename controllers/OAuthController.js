import { AppModel } from "../models/AppModel.js";

export class AuthMiddleware {
    static async ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next();
        res.redirect('/session');
    }

    static async Logout(req, res, next) {
        req.logout(function (err) {
            if (err) return next(err);
            req.session.destroy((err) => {
                if (err) return next(err);
                res.clearCookie('connect.sid');
                return res.redirect('/session');
            });
        });
    }

    static async Login(req, res) {
        res.render('dashboards/login', {
            layout: 'layouts/dashboard',
            title: 'Login',
            isAuth: true
        });
    }

    static async Dashboard(req, res) {
        try {
            res.render('dashboards/index', {
                layout: 'layouts/dashboard',
                title: 'Dashboard',
                isAuth: false,
                user: req.user
            });
        } catch (error) {
            console.error("Error fetching pending users:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    static async Users(req, res) {
        try {
            const { users, lastCursor } = await AppModel.pendingUser();
            res.render('dashboards/users', {
                layout: 'layouts/dashboard',
                title: 'User Management',
                isAuth: false,
                user: req.user,
                users,
                nextPageCursor: lastCursor ? lastCursor.toISOString() : null
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}