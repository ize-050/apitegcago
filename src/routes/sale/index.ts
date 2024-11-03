import { Router } from 'express';
import { SaleController } from '../../controllers/sale/index.controller';

import {CustomerController} from '../../controllers/customer/index.controller'
import SaleService from '../../services/sale/index.service';
import SaleRepository from '../../repository/sale/index.repository';
import authMiddleware from '../../middleware/authMiddleware';
import express from 'express'
import { Request, Response } from 'express';
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

var uploadDoucment = multer();
const router = Router()



const saleController = new SaleController();
const customerController = new CustomerController();

router.get('/getCustomer',authMiddleware, (req, res) =>  saleController.getCustomer(req, res));
router.get('/getCustomerDetail/:id',authMiddleware, (req, res) =>  saleController.getCustomerDetail(req, res));
router.post('/createCustomer',authMiddleware, (req, res) => saleController.createCustomer(req, res));
router.put('/editCustomer/:id',authMiddleware, (req, res) => saleController.editCustomer(req, res));
router.post('/changetagStatus/:id',authMiddleware, (req, res) => saleController.changeTagStatus(req, res));


router.post('/submitEstimate/:id',authMiddleware,upload.array('d_image',10), (req, res) => saleController.submitEstimate(req,res));
router.put('/updatePreEstimate/:id',authMiddleware,upload.array('d_image',10), (req, res) => saleController.updatePreEstimate(req, res));
router.put('/updateDocument/:id',authMiddleware, upload.any(), (req, res) => saleController.updateDocument(req, res));


router.get('/getAllEstimate',authMiddleware, (req, res) => saleController.getAllEstimate(req, res));
router.get('/getEstimate/:id',authMiddleware, (req, res) => saleController.getEstimate(req, res));
router.put('/applyEmployee/:id',authMiddleware, (req, res) => saleController.applyEmployee(req, res));
router.put('/acceptJob/:id',authMiddleware, (req, res) => saleController.acceptJob(req, res));
router.delete('/cancelJob/:id',authMiddleware, (req, res) => saleController.cancelJob(req, res));
router.put('/cancelEstimate/:id',authMiddleware, (req, res) => saleController.cancelEstimate(req, res));

router.post('/submitAddorderPurchase/:id',upload.array('files',10),authMiddleware, (req, res) => saleController.submitAddorderPurchase(req, res));


router.put('/updatestatusPurchase/:id',authMiddleware, (req, res) => saleController.updatestatusPurchase(req, res));


//confirmpayment
router.post('/submitpayment/:id',authMiddleware, 
upload.any(),

(req, res) => saleController.submitpayment(req, res));

//util

router.get('/getSelectCustomer',authMiddleware, (req, res) => customerController.getSelectCustomer(req, res));
router.get('/getCheckBooking',authMiddleware, (req, res) => saleController.getCheckBooking(req, res));


module.exports = router