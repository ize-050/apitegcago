import { Router } from 'express';
import { CSStatusController } from '../../controllers/cs_status/index.controller';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // For password hashing


import express from 'express'
import { Request, Response } from 'express';
import authMiddleware from '../../middleware/authMiddleware';
const router = Router()

import multer from 'multer';
import path from 'path'
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

const csStatusController = new CSStatusController();

//cs_Status
router.get('/getDataCsStatus/:id',authMiddleware, (req, res) =>  csStatusController.getDataCsStatus(req, res));

//bookcabinet
router.get("/getDataBookcabinet/:id",authMiddleware, (req, res) => csStatusController.getBookcabinet(req, res));
router.post('/createBookcabinet/:id',authMiddleware,upload.array("book_picture",10), (req, res)=> csStatusController.createBookcabinet(req, res));

//receipt
router.get("/getDataReceive/:id",authMiddleware, (req, res) => csStatusController.getReceipt(req, res));
router.post('/createReceive/:id',authMiddleware, upload.array("receive_picture", 10),(req, res)=> csStatusController.createReceive(req, res));

//contain
router.get("/getContain/:id",authMiddleware, (req, res) => csStatusController.getContain(req, res));
router.post('/createContain/:id',authMiddleware, upload.any(),(req, res)=> csStatusController.createContain(req, res));

//document
const fileUploadFields = [
    { name: 'document_file_invoice', maxCount: 5 },
    { name: 'document_packinglist', maxCount: 5 },
    { name: 'document_file_packing', maxCount: 5 },
    { name: 'document_FE', maxCount: 5 },
    { name: 'document_file_etc', maxCount: 5 },
    { name: 'document_approve', maxCount: 5 },
    { name: 'file_draft_invoice', maxCount: 5 },
    { name: 'document_BL', maxCount: 5 },
    { name: 'document_file_master_BL', maxCount: 5 },
  ];

router.post('/createDocumentStatus/:id',authMiddleware,  upload.any(),(req, res)=> {
    console.log("req.files",req.files)
    csStatusController.createDocuments(req, res)});

router.get('/getDocumentStatus/:id',authMiddleware, (req, res) =>  csStatusController.getDocumentStatus(req, res));


//CreateDeparture
router.post('/createDeparture/:id',authMiddleware,(req, res)=> csStatusController.createDeparture(req, res));
router.get('/getDeparture/:id',authMiddleware, (req, res) =>  csStatusController.getDeparture(req, res));


//wait_release
router.post('/createWaitRelease/:id',  upload.any() ,authMiddleware,(req, res)=> csStatusController.createWaitRelease(req, res));
router.get('/getWaitRelease/:id', authMiddleware, (req, res) =>  csStatusController.getWaitRelease(req, res));
module.exports = router