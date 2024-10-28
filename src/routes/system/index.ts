import { Router } from 'express';
import { SystemController } from '../../controllers/system/index.controller';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // For password hashing


import express from 'express'
import { Request, Response } from 'express';
import authMiddleware from '../../middleware/authMiddleware';
const router = Router()


const systemController = new SystemController();

//agency
router.get('/agency/getDataAgency',authMiddleware, (req, res) =>  systemController.getAgencyData(req, res));
router.post('/agency/create',authMiddleware, (req, res)=> systemController.createAgency(req, res));
router.put('/agency/edit/:id',authMiddleware, (req, res)=> systemController.updateAgency(req, res));
router.delete('/agency/delete/:id',authMiddleware, (req, res)=> systemController.deleteAgency(req, res));



//docuement

router.get('/document/getDocument',authMiddleware, (req, res) =>  systemController.getDocumentData(req, res));

//current
router.get('/currency/getCurrent',authMiddleware, (req, res) =>  systemController.getCurrent(req, res));
router.post('/currency/create',authMiddleware, (req, res)=> systemController.createCurrent(req, res));
router.put('/currency/edit/:id',authMiddleware, (req, res)=> systemController.updateCurrent(req, res));
router.delete('/currency/delete/:id',authMiddleware, (req, res)=> systemController.deleteCurrent(req, res));


module.exports = router