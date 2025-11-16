import { AppModel } from "../models/AppModel.js";
import { getGithubUserDetailFromDB } from "../services/githubService.js";

export class AuthMiddleware {
    static async ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next();
        res.redirect('/session');
    }

    static async ensureNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return res.redirect('/workspace'); // atau redirect ke dashboard
        return next();
    }

    static async Logout(req, res, next) {
        try {
            req.logout(function (err) {
                if (err) return next(err);
                // Destroy session Express.js
                if (req.session) {
                    req.session.destroy((err) => {
                        if (err) return next(err);
                        res.clearCookie('connect.sid', { path: '/' });
                        res.cookie('logout_prompt_github', 'true', {
                            maxAge: 10 * 1000,
                            httpOnly: false,
                            path: '/'
                        });
                        console.log("✅ Logout success: session destroyed & cookie exp cleared");
                        return res.redirect('/session');
                    });
                } else {
                    // Jika req.session sudah null (mungkin sudah dihancurkan oleh req.logout versi terbaru)
                    res.clearCookie('connect.sid', { path: '/' });
                    res.cookie('logout_prompt_github', 'true', {
                        maxAge: 10 * 1000,
                        httpOnly: false,
                        path: '/'
                    });
                    console.log("✅ Logout success: session already null, cookie cleared. Redirecting to /session.");
                    return res.redirect('/session');
                }
            });
        } catch (error) {
            console.error("Logout error (AuthMiddleware):", error);
            return next(error);
        }
    }

    static async Login(req, res) {
        const errorMsg = req.cookies['oauth_error'];
        const logoutPromptGithub = req.cookies['logout_prompt_github'];
        if (errorMsg) res.clearCookie('oauth_error', { path: '/' });
        if (logoutPromptGithub) res.clearCookie('logout_prompt_github', { path: '/' });
        res.render('dashboards/login', {
            layout: 'layouts/login',  // Gunakan layout login mazer
            title: 'Login',
            isAuth: true,
            errorMsg,
            logoutPromptGithub
        });
    }

    static async Dashboard(req, res) {
        try {
            // Ambil data profil lengkap dari NetUserDetail berdasarkan username dari session
            const githubUsername = req.user.githubUsername || req.user.GithubUserName;
            let userDetail = null;
            if (githubUsername) userDetail = await getGithubUserDetailFromDB(githubUsername);
            const userData = {
                ...req.user,
                ...userDetail
            };
            res.render('dashboards/index', {
                layout: 'layouts/dashboard',
                title: 'Dashboard',
                isAuth: false,
                user: userData
            });
        } catch (error) {
            console.error("Error in Dashboard:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    static async Users(req, res) {
        try {
            // Ambil data profil lengkap dari NetUserDetail berdasarkan username dari session
            const githubUsername = req.user.githubUsername || req.user.GithubUserName;
            let userDetail = null;

            if (githubUsername) userDetail = await getGithubUserDetailFromDB(githubUsername);
            // Gabungkan data dari session dengan data dari NetUserDetail
            const userData = {
                ...req.user,
                ...userDetail
            };
            const { users, lastCursor } = await AppModel.pendingUser();
            res.render('dashboards/users', {
                layout: 'layouts/dashboard',
                title: 'User Management',
                isAuth: false,
                user: userData,
                users,
                nextPageCursor: lastCursor ? lastCursor.toISOString() : null
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    static async Roles(req, res) {
        try {
            // Ambil data profil lengkap dari NetUserDetail berdasarkan username dari session
            const githubUsername = req.user.githubUsername || req.user.GithubUserName;
            let userDetail = null;

            if (githubUsername) userDetail = await getGithubUserDetailFromDB(githubUsername);
            // Gabungkan data dari session dengan data dari NetUserDetail
            const userData = {
                ...req.user,
                ...userDetail
            };
            // const { users, lastCursor } = await AppModel.pendingUser();
            res.render('dashboards/roles', {
                layout: 'layouts/dashboard',
                title: 'Role Management',
                isAuth: false,
                user: userData,
                // users,
                // nextPageCursor: lastCursor ? lastCursor.toISOString() : null
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}