import { Router } from 'express';

import express from 'express'

const router = Router()

const RouterSale = require("./sale")
const RouterUser = require("./user")
const RouterCs   = require("./cs")
const Notification = require("./notification")

const SystemRouter = require('./system')
const Csstatus = require('./cs_status')

const Superadmin = require('./superadmin')

const FinanceRouter = require('./finance')
const EmployeeRouter = require('./employee')
const HrRouter = require('./hr')
const SaleDashboardRouter = require('./dashboard/sale-dashboard.routes')
const ManagerRouter = require('./manager.routes')


router.use('/superadmin',Superadmin)
router.use('/user',RouterUser)
router.use('/sale',RouterSale)
router.use('/cs',RouterCs)
router.use('/notification',Notification)
router.use('/system',SystemRouter)
router.use('/cs_status',Csstatus)
router.use('/finance',FinanceRouter)
router.use('/employee',EmployeeRouter)
router.use('/hr', HrRouter)
router.use('/dashboard/sale', SaleDashboardRouter)
router.use('/manager', ManagerRouter)



module.exports = router