import { Router } from 'express';
import { SaleController } from '../../controllers/sale/index.controller';
import SaleService from '../../services/sale/index.service';
import SaleRepository from '../../repository/sale/index.repository';
import authMiddleware from '../../middleware/authMiddleware';
import express from 'express'
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/temp'); // Specify the directory where you want to store files
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
    }
  });

var upload = multer({ storage: storage });
const router = Router()



const saleController = new SaleController();

router.get('/getCustomer',authMiddleware, (req, res) =>  saleController.getCustomer(req, res));
router.post('/createCustomer',authMiddleware, (req, res) => saleController.createCustomer(req, res));
router.put('/editCustomer/:id',authMiddleware, (req, res) => saleController.editCustomer(req, res));
router.put('/changetagStatus/:id',authMiddleware, (req, res) => saleController.changeTagStatus(req, res));
router.post('/submitEstimate/:id',authMiddleware,upload.array('d_image',10), (req, res) => saleController.submitEstimate(req,res));
module.exports = router