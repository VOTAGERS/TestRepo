import express from 'express';
import { AppController } from '../controllers/AppController.js';
import { AuthMiddleware } from '../controllers/OAuthController.js';
import { passport } from '../middleware/sessionMiddleware.js';
import { handleGithubCallback } from '../services/githubService.js';

const router = express.Router();
const middleware = AuthMiddleware.ensureAuthenticated

router.get('/', AppController.Index);
router.post('/join', AppController.Register);
router.post('/githubcheck', AppController.GithubUserCheck);
router.post('/approve/:id', AppController.Approve);

router.get('/session', AuthMiddleware.ensureNotAuthenticated, AuthMiddleware.Login);
router.get('/workspace', (req, res, next) => {
  console.log("🔐 Auth status:", req.isAuthenticated(), "User:", req.user);
  next();
}, middleware, AuthMiddleware.Dashboard);
router.get('/users', middleware, AuthMiddleware.Users);

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', handleGithubCallback);
router.get('/logout', AuthMiddleware.Logout);
export default router;