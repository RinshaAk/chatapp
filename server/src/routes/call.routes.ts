import { Router } from 'express';
import { CallController } from '../controllers/call.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/history', CallController.getCallHistory);
router.post('/log', CallController.createCallLog);
router.put('/:callId/status', CallController.updateCallStatus);

export default router;
