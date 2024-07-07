import { Router } from 'express';

import express from 'express'

const router = Router()

const RouterSale = require("./sale")
const RouterUser = require("./user")

router.use('/user',RouterUser)
router.use('/sale',RouterSale);



module.exports = router