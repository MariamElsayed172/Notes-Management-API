import { auth } from '../../middleware/auth.middleware.js'
import * as authService from './auth.service.js'
import {Router} from 'express'
const router = Router()

router.post('/signup' , authService.signup)
router.post('/login', authService.login)
router.patch('/update', auth, authService.updateUser)
router.delete('/delete', auth , authService.deleteUser)
router.get('/search', auth , authService.getUser)
export default router