import { Router } from 'express';
import { CSController } from '../../controllers/cs/index.controller';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // For password hashing


import express from 'express'
import { Request, Response } from 'express';
import authMiddleware from "../../middleware/authMiddleware";
import multer from "multer";
import path from "path";
const router = Router()
const { v4: uuidv4 } = require('uuid');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/temp'); // Specify the directory where you want to store files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${uuidv4()}`+path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage });
const csController = new CSController();




router.get('/getPurchase', authMiddleware,(req, res) =>  csController.getPurchase(req, res));
//cs
router.get('/getAllCs', authMiddleware,(req, res) =>  csController.getAllCs(req, res));
router.get('/getPurchaseDetail/:id',authMiddleware, (req, res) =>  csController.getPurchaseDetail(req, res));
router.put('/updateTriggleStatus/:id',authMiddleware, (req, res) =>  csController.updateTriggleStatus(req, res));

router.get('/getDocumentByid/:id',authMiddleware, (req, res) =>  csController.getDocumentByid(req, res));
router.get('/getAgentCy',authMiddleware, (req, res) =>  csController.getAgentCy(req, res));

router.post('/SubmitAddAgency/:id',authMiddleware,upload.array('d_image',10), (req, res) =>  csController.SubmitAddAgency(req, res));

router.put('/updateAgency/:id',authMiddleware,upload.array('d_image',10), (req, res) =>  csController.updateAgency(req, res));
router.post('/updateAgencytoSale',authMiddleware, (req, res) =>  csController.updateAgencytoSale(req, res));

router.post('/SentRequestFile/:id' ,authMiddleware, (req, res) =>  csController.SentRequestFile(req, res));

router.post('/submitAddpayment/:id',authMiddleware, (req, res) =>  csController.submitAddpayment(req, res));



module.exports = router