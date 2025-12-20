import express from 'express';
import { AppController } from '../controllers/AppController.js';
import { AuthMiddleware } from '../controllers/OAuthController.js';
import { RoleManagementController } from '../controllers/RoleManagementController.js';
import { passport, ensureAdmin } from '../middleware/sessionMiddleware.js';
import { handleGithubCallback } from '../services/githubService.js';

const router = express.Router();
const middleware = AuthMiddleware.ensureAuthenticated;

router.get('/', AppController.Index);
router.post('/join', AppController.Register);
router.post('/githubcheck', AppController.GithubUserCheck);
router.post('/approve/:id', AppController.Approve);
router.post('/reject/:id', AppController.Reject);

router.get('/session', AuthMiddleware.ensureNotAuthenticated, AuthMiddleware.Login);
router.get('/workspace', (req, res, next) => {
  next();
}, middleware, AuthMiddleware.Dashboard);

// Protected Admin Routes
router.get('/users', middleware, ensureAdmin, AuthMiddleware.Users);
router.get('/roles', middleware, ensureAdmin, RoleManagementController.Roles);
router.post('/api/roles', middleware, ensureAdmin, RoleManagementController.CreateRole);
router.put('/api/roles/:id', middleware, ensureAdmin, RoleManagementController.UpdateRole);
router.delete('/api/roles/:id', middleware, ensureAdmin, RoleManagementController.DeleteRole);

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', handleGithubCallback);
router.get('/logout', AuthMiddleware.Logout);
// user detail
router.get('/api/users/:username/detail', AppController.UserDetail);

export default router;