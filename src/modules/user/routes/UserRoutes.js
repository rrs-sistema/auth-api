import { Router } from 'express';

import UserController from '../controller/UserController.js';
import checkToken from '../../../config/auth/checkToken.js';

const router = new Router();
router.post('/api/user/auth', UserController.getAccessToken);
router.post('/api/user/create', UserController.createUser);

router.use(checkToken);
router.get('/api/users', UserController.findAll);
router.get('/api/user/email/:email', UserController.findByEmail);

export default router;

