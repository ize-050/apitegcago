import { Router } from 'express';

import express from 'express'

const router = Router()

const RouterSale = require("./sale")
const RouterUser = require("./user")
const RouterCs   = require("./cs")

router.use('/user',RouterUser)
router.use('/sale',RouterSale);

router.use('/cs',RouterCs)


module.exports = router