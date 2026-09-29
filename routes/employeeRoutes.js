const express = require('express');
const router = express.Router();

const User = require('../models/user.js')
const {isLoggedIn, hasPermission} = require('../utils/middlewares.js');
const { toggleStatus } = require('../controller/commonStatusController');
const employeeController = require('../controller/employeeController.js');


//Render Employee View Page
router.get('/employee', isLoggedIn, hasPermission('employee'), employeeController.renderEmployeeViewPage);

//Render Add New Employee Page
router.get('/employee/add', isLoggedIn, hasPermission('employee'), employeeController.renderAddEmployeePage);

//Employee Add New Route
router.post('/employee/add', isLoggedIn, hasPermission('employee'), employeeController.AddNewEmployeeRoute);

//Render Employee Edit Page
router.get('/employee/:id/edit', isLoggedIn, hasPermission('employee'), employeeController.renderEditEmployeePage);

//Employee Update Route
router.put('/employee/:id/edit', isLoggedIn, hasPermission('employee'), employeeController.employeeUpdateRoute);

//Employee Delete Route
router.delete('/employee/:id',isLoggedIn, hasPermission('employee'), employeeController.employeeDeleteRoute);

//Status Change Route
router.post(
    '/employee/:id/toggle-status',
    isLoggedIn,
    hasPermission('employee'),
    toggleStatus(User)
);
module.exports = router;