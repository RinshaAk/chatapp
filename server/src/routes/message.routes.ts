import { Router } from 'express';
import { MessageController } from '../controllers/message.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/search', MessageController.searchMessages);
router.get('/chat/:chatId', MessageController.getChatMessages);
router.post('/chat/:chatId', upload.array('attachments', 10), MessageController.sendMessage);
router.post('/chat/:chatId/read', MessageController.markAsRead);
router.post('/:messageId/reaction', MessageController.addReaction);
router.put('/:messageId', MessageController.editMessage);
router.delete('/:messageId', MessageController.deleteMessage);

export default router;
