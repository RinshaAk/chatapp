import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', ChatController.getUserChats);
router.post('/direct', ChatController.getOrCreateDirectChat);
router.post('/group', ChatController.createGroupChat);
router.post('/:chatId/pin', ChatController.togglePinChat);
router.post('/:chatId/mute', ChatController.toggleMuteChat);
router.post('/:chatId/members', ChatController.addGroupMembers);
router.delete('/:chatId/members/:targetUserId', ChatController.removeGroupMember);

export default router;
