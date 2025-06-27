import express from 'express';
import { AppController } from '../controllers/AppController.js';
import { AuthMiddleware } from '../controllers/OAuthController.js';
import passport from '../services/githubService.js';
const router = express.Router();
const middleware = AuthMiddleware.ensureAuthenticated

router.get('/', AppController.Index);
router.post('/join', AppController.Register);

router.get('/session', AuthMiddleware.Login);
router.get('/workspace', middleware, AuthMiddleware.Dashboard);
router.get('/users', middleware, AuthMiddleware.Users);

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/session',
  successRedirect: '/workspace'
}));
router.get('/logout', AuthMiddleware.Logout);
export default router;