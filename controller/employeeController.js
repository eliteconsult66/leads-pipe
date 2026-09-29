//User model
const User = require('../models/user.js');

//User model
const Role = require('../models/role.js');

//Common Status Controller
const { toggleStatus } = require('./commonStatusController.js');

//WrapAsync
const WrapAsync = require('../utils/WrapAsync');

//Render Employee View Page
module.exports.renderEmployeeViewPage = WrapAsync(async (req, res) => {

    const employees = await User.find({isMasterAdmin: false})
        .populate('role')
        .sort({ createdAt: -1 });

    res.render('adminrole/employee/view', {
        employees
    });
});

//Render Add New Employee Page
module.exports.renderAddEmployeePage = WrapAsync (async(req, res) => {
    const roles = await Role.find();
    res.render('adminrole/employee/add', {roles});
});

//Render Employee Edit Page
module.exports.renderEditEmployeePage = WrapAsync(async(req, res) => {
        const employee = await User.findById(req.params.id);
    
        if (!employee) {
    
            req.flash(
                'error',
                'Employee not found'
            );
    
            return res.redirect('/employee');
        }

        const roles = await Role.find();
    
        res.render('adminrole/employee/edit.ejs', {
            employee, roles
        });
});

//Employee Add New Route
module.exports.AddNewEmployeeRoute = WrapAsync(async (req, res) => {

    const {
        name,
        username,
        email,
        password,
        role,
        status
    } = req.body;

    // Check existing employee
    const existingEmployee = await User.findOne({ email });

    if (existingEmployee) {
        req.flash('error', 'Employee email already exists, please enter unique email');
        return res.redirect('/employee/add');
    }

    const employee = new User({
        name,
        username,
        email,
        role,
        status
    });

    // passport-local-mongoose password hash karega
    const registeredEmployee = await User.register(
        employee,
        password
    );

    req.flash('success', 'Employee created successfully');

    res.redirect('/employee');

});

//Employee Update Route
module.exports.employeeUpdateRoute = WrapAsync(async (req, res) => {

    const { name, username,email, role, status, password } = req.body;

    const employee = await User.findById(req.params.id);

    if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/admin/employee');
    }

    employee.name = name;
    employee.email = email;
    employee.role = role;
    employee.username = username;
    employee.status = status;

    // Password sirf tab update karo jab field fill ho
    if (password && password.trim() !== '') {
        await employee.setPassword(password);
    }

    await employee.save();

    req.flash('success', 'Employee updated successfully');

    res.redirect('/employee');

});

//Employee Delete Route
module.exports.employeeDeleteRoute = WrapAsync(async (req, res) => {

    await User.findByIdAndDelete(req.params.id);

    req.flash('success', 'Employee deleted successfully');

    res.redirect('/employee');

});
