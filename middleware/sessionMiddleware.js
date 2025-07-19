import session from "express-session";
import flash from 'connect-flash';
import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import { db } from '../services/firebaseService.js';
import { config } from 'dotenv';
config();

// === PASSPORT SETUP ===
passport.serializeUser((user, done) => {
    done(null, {
        id: user.id,
        name: user.PersonalName,
        email: user.email,
        avatar: user.AvatarURL,
        githubUsername: user.GithubUserName
    });
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new GithubStrategy({
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CLIENT_URL

}, async (accessToken, refreshToken, profile, done) => {
    try {
        const githubUsername = profile.username.toLowerCase();
        // console.log("GitHub OAuth profile:", profile.username, profile.id);
        // Cek apakah user ada di database kamu
        const snapshot = await db.collection("CommunityUsers").get();
        const userDoc = snapshot.docs.find(doc =>
            (doc.data().GithubUserName || '').toLowerCase() === githubUsername 
        );
        

        if (!userDoc) {
            return done(null, false, { message: "Akun Anda belum terdaftar di platform kami." });
        }
        const userData = snapshot.docs[0].data();
        userData.AvatarURL = profile.photos?.[0]?.value;
        return done(null, {
            id: snapshot.docs[0].id,
            ...userData
        });

    } catch (error) {
        console.error("GitHub OAuth error:", error.message);
        return done(error, null);
    }
}));

// === SESSION SETUP FUNCTION ===
export function setupSession(app) {
    const sessionMiddleware = session({
        secret: "votagers-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            path: "/",
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        }
    });
    // Passport
    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use((req, res, next) => {
        if (req.session && req.session.flash) {
            res.locals.successMsg = req.flash('success');
            res.locals.errorMsg = req.flash('error');
        } else {
            res.locals.successMsg = null;
            res.locals.errorMsg = null;
        }
        res.locals.user = req.user || null;
        next();
    });
}

export { passport };