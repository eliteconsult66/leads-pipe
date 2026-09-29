const express = require('express');

const router = express.Router();

const formController = require('../controller/formsController');
const Form = require('../models/forms.js');
const { toggleStatus } = require('../controller/commonStatusController');


// All Middlewares
const { isLoggedIn, hasPermission, hasLandingPageAccess } = require('../utils/middlewares.js');


// All Forms
router.get(
    '/forms',
    isLoggedIn, hasPermission('forms'),
    formController.renderForms
);


// Add Form Page
router.get(
    '/forms/add',
    isLoggedIn, hasPermission('forms'),
    formController.renderAddForm
);


// Create Form
router.post(
    '/forms/add',
    isLoggedIn, hasPermission('forms'),
    formController.createForm
);


// Edit Form Page
router.get(
    '/forms/:id/edit',
    isLoggedIn, hasPermission('forms'),
    formController.renderEditForm
);


// Update Form
router.put(
    '/forms/:id',
    isLoggedIn, hasPermission('forms'),
    formController.updateForm
);


// Delete Form
router.delete(
    '/forms/:id',
    isLoggedIn, hasPermission('forms'),
    formController.deleteForm
);

router.post('/forms/:id/toggle-status',
    isLoggedIn,
    hasPermission('forms'),
    toggleStatus(Form)
);


module.exports = router;