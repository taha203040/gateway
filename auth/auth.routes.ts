import { Router } from 'express'
import { login }  from './login.middleware'
import { signup } from './signup.middleware'

const authRouter = Router()

authRouter.post('/login',  login)
authRouter.post('/signup', signup)

export default authRouter
