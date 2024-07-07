import { Router } from 'express';
import { SaleController } from '../../controllers/sale/index.controller';
import SaleService from '../../services/sale/index.service';
import SaleRepository from '../../repository/sale/index.repository';

import express from 'express'
import { Request, Response } from 'express';
const router = Router()



const saleController = new SaleController();

router.get('/getCustomer', (req, res) =>  saleController.getCustomer(req, res));

module.exports = router