const moment = require('moment');

const Form = require('../models/forms.js');
const Enquiry = require('../models/enquiries.js');

const WrapAsync = require('../utils/WrapAsync.js');


/*
|--------------------------------------------------------------------------
| Technical Fluent Forms Fields
|--------------------------------------------------------------------------
*/

const shouldHideField = (key) => {

    const normalizedKey = key
        .toLowerCase()
        .replace(/[\s_-]/g, '');


    if (normalizedKey.includes('turnstile')) {
        return true;
    }

    if (normalizedKey.includes('cfturnstileresponse')) {
        return true;
    }

    if (normalizedKey.includes('nonce')) {
        return true;
    }

    if (normalizedKey.includes('fluentformembeddedpostid')) {
        return true;
    }

    if (normalizedKey.includes('fluentformembdedpostid')) {
        return true;
    }

    if (normalizedKey.includes('wphttpreferer')) {
        return true;
    }

    if (normalizedKey.includes('httpreferer')) {
        return true;
    }


    return false;
};


/*
|--------------------------------------------------------------------------
| Convert Field Name To Readable Heading
|--------------------------------------------------------------------------
*/

const formatFieldName = (key) => {

    return key
        .replace(/^_+/, '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());

};


/*
|--------------------------------------------------------------------------
| Convert Values For CSV
|--------------------------------------------------------------------------
*/

const formatValue = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '';
    }


    if (Array.isArray(value)) {

        return value.join(', ');

    }


    if (typeof value === 'object') {

        return Object.values(value)
            .filter(Boolean)
            .join(' ');

    }


    return String(value);

};


/*
|--------------------------------------------------------------------------
| CSV Escape
|--------------------------------------------------------------------------
*/

const escapeCsvValue = (value) => {

    const stringValue = String(value ?? '');

    return `"${stringValue.replace(/"/g, '""')}"`;

};


/*
|--------------------------------------------------------------------------
| Get Date Range
|--------------------------------------------------------------------------
*/

const getDateRange = (range, from, to) => {

    const now = moment();

    let startDate;
    let endDate = moment().endOf('day');


    switch (range) {


        case 'today':

            startDate = moment().startOf('day');

            break;


        case '3-days':

            startDate = moment()
                .subtract(2, 'days')
                .startOf('day');

            break;


        case '7-days':

            startDate = moment()
                .subtract(6, 'days')
                .startOf('day');

            break;


        case '30-days':

            startDate = moment()
                .subtract(29, 'days')
                .startOf('day');

            break;


        case '3-months':

            startDate = moment()
                .subtract(3, 'months')
                .startOf('day');

            break;


        case '6-months':

            startDate = moment()
                .subtract(6, 'months')
                .startOf('day');

            break;


        case '1-year':

            startDate = moment()
                .subtract(1, 'year')
                .startOf('day');

            break;


        case 'custom':

            if (!from || !to) {
                return null;
            }


            startDate = moment(
                from,
                'YYYY-MM-DD',
                true
            ).startOf('day');


            endDate = moment(
                to,
                'YYYY-MM-DD',
                true
            ).endOf('day');


            if (
                !startDate.isValid() ||
                !endDate.isValid()
            ) {
                return null;
            }


            if (startDate.isAfter(endDate)) {
                return null;
            }


            break;


        default:

            return null;

    }


    return {
        startDate: startDate.toDate(),
        endDate: endDate.toDate()
    };

};


/*
|--------------------------------------------------------------------------
| Export Form Enquiries
|--------------------------------------------------------------------------
*/

module.exports.exportFormEnquiries = WrapAsync(async (req, res) => {

    const {
        formId,
        range
    } = req.params;


    const {
        from,
        to
    } = req.query;


    /*
    |--------------------------------------------------------------------------
    | Find Form
    |--------------------------------------------------------------------------
    */

    const form = await Form.findById(formId)
        .populate('landingPage');


    if (!form) {

        req.flash(
            'error',
            'Form not found'
        );

        return res.redirect('/dashboard');

    }


    /*
    |--------------------------------------------------------------------------
    | Date Range
    |--------------------------------------------------------------------------
    */

    const dateRange = getDateRange(
        range,
        from,
        to
    );


    if (!dateRange) {

        req.flash(
            'error',
            'Invalid export date range'
        );

        return res.redirect(
            `/forms/${formId}/enquiries`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Get Enquiries
    |--------------------------------------------------------------------------
    */

    const enquiries = await Enquiry.find({

        formId: form._id,

        createdAt: {

            $gte: dateRange.startDate,

            $lte: dateRange.endDate

        }

    }).sort({

        createdAt: -1

    });


    if (enquiries.length === 0) {

        req.flash(
            'error',
            'No enquiries found for selected period'
        );

        return res.redirect(
            `/forms/${formId}/enquiries`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Get Dynamic Fields
    |--------------------------------------------------------------------------
    */

    const fieldKeys = [

        ...new Set(

            enquiries.flatMap(enquiry =>

                Object.keys(
                    enquiry.formData || {}
                )

            )

        )

    ].filter(key => !shouldHideField(key));


    /*
    |--------------------------------------------------------------------------
    | CSV Headers
    |--------------------------------------------------------------------------
    */

    const headers = [

        'Enquiry ID',

        'Landing Page',

        'Form',

        'Fluent Form ID',

        'Submission ID',

        ...fieldKeys.map(formatFieldName),

        'Submitted Date',

        'Submitted Time'

    ];


    /*
    |--------------------------------------------------------------------------
    | CSV Rows
    |--------------------------------------------------------------------------
    */

    const rows = enquiries.map(enquiry => {

        const formData =
            enquiry.formData || {};


        return [

            enquiry._id,

            form.landingPage
                ? form.landingPage.name
                : '',

            form.name,

            enquiry.fluentFormId,

            enquiry.fluentSubmissionId,

            ...fieldKeys.map(key => {

                return formatValue(
                    formData[key]
                );

            }),

            moment(enquiry.createdAt)
                .format('YYYY-MM-DD'),

            moment(enquiry.createdAt)
                .format('hh:mm A')

        ];

    });


    /*
    |--------------------------------------------------------------------------
    | Create CSV
    |--------------------------------------------------------------------------
    */

    const csvLines = [

        headers
            .map(escapeCsvValue)
            .join(','),

        ...rows.map(row =>

            row
                .map(escapeCsvValue)
                .join(',')

        )

    ];


    /*
     * BOM added so Excel properly reads UTF-8
     */

    const csv =
        '\uFEFF' +
        csvLines.join('\n');


    /*
    |--------------------------------------------------------------------------
    | File Name
    |--------------------------------------------------------------------------
    */

    const safeFormName = form.slug ||
        form.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-');


    const dateStamp =
        moment().format('YYYY-MM-DD');


    const fileName =
        `${safeFormName}-${range}-${dateStamp}.csv`;


    /*
    |--------------------------------------------------------------------------
    | Download
    |--------------------------------------------------------------------------
    */

    res.setHeader(
        'Content-Type',
        'text/csv; charset=utf-8'
    );


    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
    );


    return res.send(csv);

});