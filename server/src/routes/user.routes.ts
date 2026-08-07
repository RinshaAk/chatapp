import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/search', UserController.searchUsers);
router.get('/blocked', UserController.getBlockedUsers);
router.get('/profile/:userId', UserController.getProfile);
router.put(
  '/profile',
  upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  UserController.updateProfile
);
router.post('/block/:targetUserId', UserController.blockUser);
router.post('/unblock/:targetUserId', UserController.unblockUser);

export default router;
