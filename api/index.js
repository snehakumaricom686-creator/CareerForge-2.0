// Vercel Serverless API Entry Point
// This file wraps the Express app for Vercel serverless functions
require('dotenv').config();
const app = require('../resume-builder-backend/src/app');
const connectDB = require('../resume-builder-backend/src/config/db');

// Database connection (with caching for serverless)
let isConnected = false;

module.exports = async (req, res) => {
    // Ensure DB is connected before handling request
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }

    return app(req, res);
};
