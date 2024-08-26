import { Router } from 'express';

import express from 'express'

const router = Router()

const RouterSale = require("./sale")
const RouterUser = require("./user")
const RouterCs   = require("./cs")
const Notification = require("./notification")

const SystemRouter = require('./system')
const Csstatus = require('./cs_status')

router.use('/user',RouterUser)
router.use('/sale',RouterSale)
router.use('/cs',RouterCs)
router.use('/notification',Notification)
router.use('/system',SystemRouter)
router.use('/cs_status',Csstatus)


module.exports = router