// API routes
var express = require('express');
var router = express.Router();
const db = require('../config/db');

// Get products from database
router.get('/products', (req, res) => {
    console.log("router.get: req.query.cateid:",req.query.cateid);
    const cateid = req.query.cateid ? parseInt(req.query.cateid, 10) : null;
     // if cateid==nullor1, return all products
     if (cateid === null || cateid === 1) {
        console.log("Getting all products");
        let sql = 'SELECT * FROM products';
        db.query(sql, (err, results) => {
            if(err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ error: "Database query error" });
            }
            return res.json(results);
        });
    }
    //if cateif !=0 and 1, return products of corresponding category
    else if (cateid > 1) {
        console.log("Getting products for category:", cateid);
        db.query("SELECT * FROM products WHERE cateid = ?", [cateid], (err, results) => {
            if (err) {
                console.error("❌ Failed to query:", err);
                return res.status(500).json({ error: "Database query error" });
            }
            return res.json(results);
        });
    }
    // if cateid is invalid, return error
    else {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid category ID' 
        });
    }
});

// Get all the categories from database
router.get('/categories', (req, res) => {
    let sql = 'SELECT * FROM categories';
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        res.json(results);
    });
});


// Get a product by id from database
router.get('/products/:id', (req, res) => {
    let sql = `SELECT * FROM products WHERE pid = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        res.json(result);
    });
});

// Add a product to database
let now = new Date();
let formattedDate = now.toISOString().slice(0, 19).replace('T', ' '); // format date
router.post('/products', (req, res) => {
    let data = {
        name: req.body.name,                // product name
        cateid: req.body.cateid,            // category ID
        price: req.body.price,              // price
        stock: req.body.stock,              // stock
        description: req.body.description,  // description
        imageUrl: req.body.imageUrl,        // image URL
        createdAt: formattedDate            // created time
    };
    let sql = 'INSERT INTO products SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        res.json({message: 'Product added successfully!'});
    });
});

// Update a product in database
router.put('/products/:id', (req, res) => {
    const pid = req.params.id;  // product ID
    console.log("router.put: req.params.id:",req.params.id);
    const {name, cateid, price, stock, description, imageUrl} = req.body;
    console.log("router.put: req.body:",req.body);
    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (cateid !== undefined) updateData.cateid = cateid;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
//    if (rating !== undefined) updateData.rating = rating;
 //   if (reviews !== undefined) updateData.reviews = reviews;
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No update" });
    }
    let sql = 'UPDATE products SET ? WHERE pid = ?';
    db.query(sql, [updateData, pid], (err, result) => {
        if(err) throw err;
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Product ID wrong" });
        }
        res.json({ message: "✅ Product updated Successfully!", updatedFields: updateData });
    });
});

// Delete a product from database
router.delete('/products/:id', (req, res) => {
    let sql = `DELETE FROM products WHERE pid = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        res.json({message: 'Product deleted successfully!'});
    });
});

// Export the router
module.exports = router;