import { Router } from 'express';

import oauthRouter from './oauth';

export const router = Router();

router.use('/oauth', oauthRouter);

export default router;
