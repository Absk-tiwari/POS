const express = require("express");
const Product = require('../models/Product');
const CashierSession = require('../models/CashierSession');
const CashRegister = require('../models/CashRegister');
const router = express.Router();

const fetchuser= require('../middlewares/loggedIn');
const { getCurrentDate } = require("../utils");
let error = { status : false, message:'Something went wrong!' }


router.get('/products/:img', fetchuser, async(req, res) => { // updated function
    try
    {
        let products;
        const cols = [
            'id',
            'name',
            'price',
            'code',
            'category_id',
            'sales_desc',
            'tax',
            'quantity',
            'image',
        ];

        if (req.body.category_id && req.body.category_id !== 'all') {
            products = await Product.query()
            .where('added_by', req.body.myID)
            .where('pos', true).where('category_id', req.body.category_id).where('deleted',false).orderBy('quantity', 'desc').select(cols).withGraphFetched().modifyGraph('category', (builder) => {
                builder.select(
                    'product_categories.name as catName'
                );
            });
        } else {
            products = await Product.query()
            .where('added_by', req.body.myID)
            .where('pos', true).where('deleted',false).orderBy('quantity', 'desc').select(cols).withGraphFetched('category').modifyGraph('category', (builder) => {
                builder.select(
                    'product_categories.name as catName'
                );
            });
        }
        return res.json({ status:true, products: products.map(({ category, ...rest }) => ({ 
            ...rest, 
            catName: category ? category.catName : null, 
            taxAmount: rest.tax && rest.tax!=='null'? (rest.price.replace(/\s+/g, '')?.replace(",",'.') * parseFloat(rest.tax) / 100).toFixed(2) : 0.00 })) 
        })

    } catch (e) {
        error.message = e.message
        if (error.message.toLowerCase().includes('column')) {
            await runCommand(`npx knex migrate:latest --cwd ${__dirname.replace('routes','')}`); 
            return { status: false, relaunch:true, message: "Module installed, please restart." };
        }
        return res.status(400).json(error);
    }
});

// Route 3 : Get logged in user details - login required

router.post('/session', async(req, res)=> {

    const session_id = await CashierSession.query()
    .where('cash_register_id', req.body.cash_register_id )
    .orderBy('id', 'desc')
    .first();
    return res.json({ session : session_id.session_id + 1 });

});

router.post('/opening-day-cash-amount', fetchuser, async(req, res) => {
    try
    {
        let created = await CashRegister.query().insert({
            opening_cash: req.body.cash,
            closing_cash: parseFloat(req.body.cash.replace('€ ','')),
            date: getCurrentDate(),
            status: true,
            user_id: req.body.myID
        });
        return res.json({ status:true, created, message:"You can now start transactions!" });

    } catch (error) {
        return res.json({ status:false, message:error.message });
    }
});

router.get('/last-active-session', fetchuser, async(req, res)=> {
    try {
        const session = await CashRegister.query().where('user_id', req.body.myID).orderBy('id', 'desc').first();
        return res.json({ status:true, session});
    } catch (error) {
        return res.end({ status:false, reason:error.message}, 401);
    }
})

async function runCommand(command) {

    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            return {output:`⚠️ Command executed with warnings: ${stderr}`};
        }
        return {output:`✅ Command successful:\n${stdout}`};

    } catch (error) { 
        return {output:`❌ Command failed: ${error.message}`};
    }

}

module.exports=router