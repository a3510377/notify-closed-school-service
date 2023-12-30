import { getTokenFromCode } from '@/utils/line';
import { Router } from 'express';

export const router = Router();

// router.get('/line_notify', async (req, res) => {
//   const { code } = req.query;
//   if (!code) {
//     return res.json({ error: 'Invalid code' });
//   }

//   const token = await getTokenFromCode(code as string);
//   console.log(token);
//   res.json({ token });
// });

export default router;
