import { Router } from 'express';
import { UserController } from '../../controllers/user/index.controller';


import express from 'express'
import { Request, Response } from 'express';
const router = Router()


const userController = new UserController();

router.post('/login', (req, res) =>  userController.login(req, res));

module.exports = router