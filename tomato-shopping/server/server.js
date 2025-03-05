const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/product');
require('dotenv').config({ path: '/home/ubuntu/Shopping/tomato-shopping/.env' }); // load environment variables

const app = express();

// Register global middleware
app.use(cors({
    origin: '*',  // All all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // All allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // All allowed headers
    exposedHeaders: ['Content-Range', 'X-Content-Range'], // Expose headers
    credentials: true // Enable credentials
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(path.join(__dirname, "../client"))); // Serve static files from the client folder
app.use(productRoutes); 
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).send("Internal Server Error");
});
app.listen(process.env.PORT,() =>{
    console.log('Server is running at'+process.env.HOST_URL);
});
