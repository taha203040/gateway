import { Router } from 'express'
import { login }  from './login.middleware'
import { signup } from './signup.middleware'

const authRouter = Router()

authRouter.post('/api/login',  login)
authRouter.post('/api/signup', signup)

export default authRouter
