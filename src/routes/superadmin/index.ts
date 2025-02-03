import { Router } from 'express';
import { SuperadminController } from '../../controllers/superadmin/index.controller';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // For password hashing


import express from 'express'
import { Request, Response } from 'express';
const router = Router()




const superadminController = new SuperadminController();

router.get('/getEmployee', (req, res) => {
    console.log('Hitting superadmin getEmployee route');
    return superadminController.getEmployee(req, res);
});



// router.get('/getEmployee', (req, res) =>  superadminController.getEmployee(req, res));


module.exports = router