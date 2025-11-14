#!/usr/bin/env node
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');

// Import models - adjust paths for relative execution from project root
const path = require('path');
const ProductModel = require('../server/models/products');
const UserModel = require('../server/models/users');
const CategoryModel = require('../server/models/category');

const mongoDB = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopredlive';
mongoose.connect(mongoDB);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Function to hash passwords
async function encrypt(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

// Function to import test data
async function importTestData() {
    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await ProductModel.deleteMany({});
        await UserModel.deleteMany({});
        await CategoryModel.deleteMany({}); // Clear existing categories too

        // Read test data from files
        const testData = JSON.parse(fs.readFileSync('./test_data/test_data.json', 'utf8'));

        // Create a mapping from test IDs to actual MongoDB ObjectIds
        const userIdMap = new Map();
        const categoryMap = new Map(); // Map from category ID to ObjectId

        // Create categories first
        console.log('Creating categories...');
        if (testData.categories) {
            for (const categoryData of testData.categories) {
                const category = new CategoryModel({
                    name: categoryData.name
                });

                const savedCategory = await category.save();
                categoryMap.set(categoryData.id, savedCategory._id); // Map test ID to MongoDB ObjectId
                console.log(`Created category: ${categoryData.name} with ID: ${savedCategory._id}`);
            }
        }

        // Create users
        console.log(`Creating ${testData.users.length} users...`);
        for (const userData of testData.users) {
            // Hash the password before saving
            const hashedPassword = await encrypt(userData.password);

            const user = new UserModel({
                name: userData.name,
                actualName: userData.actualName,
                password: hashedPassword,
                email: userData.email,
                university: userData.university,
                campus: userData.campus,
                phone: userData.phone,
                karma: userData.karma,
                isAdmin: userData.isAdmin,
                isVerifiedStudent: userData.isVerifiedStudent,
                profilePic: userData.profilePic // Store URL directly instead of buffer for testing
            });

            const savedUser = await user.save();
            userIdMap.set(userData.id, savedUser._id); // Map test ID to MongoDB ObjectId
            console.log(`Created user: ${userData.name} with ID: ${savedUser._id}`);
        }

        // Create products
        console.log(`Creating ${testData.products.length} products...`);
        for (const productData of testData.products) {
            // Map the test user IDs to actual MongoDB ObjectIds
            const sellerId = userIdMap.get(productData.seller);
            const buyerId = productData.buyer ? userIdMap.get(productData.buyer) : null;
            // Map the category ID to actual MongoDB ObjectId
            const categoryId = productData.category ? categoryMap.get(productData.category) : null;

            const product = new ProductModel({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                currency: productData.currency,
                seller: sellerId, // Store the actual ObjectId
                buyer: buyerId, // Store the actual ObjectId
                images: productData.images, // Note: MongoDB expects Buffer but we're storing URLs for test data
                category: categoryId, // Store the actual ObjectId reference
                condition: productData.condition,
                tags: productData.tags,
                location: productData.location,
                status: productData.status,
                negotiable: productData.negotiable,
                allowsMeetup: productData.allowsMeetup,
                allowsShipping: productData.allowsShipping,
                views: productData.views
                // createdAt and updatedAt are handled by the timestamps option
            });

            const savedProduct = await product.save();
            console.log(`Created product: ${productData.name} with ID: ${savedProduct._id}`);

            // Update the seller's products array
            if (sellerId) {
                await UserModel.updateOne(
                    { _id: sellerId },
                    { $push: { products: savedProduct._id } }
                );
            }
        }

        console.log('Test data import completed successfully!');
        console.log(`Created ${testData.categories?.length || 0} categories, ${testData.users.length} users and ${testData.products.length} products.`);

    } catch (error) {
        console.error('Error importing test data:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the import
importTestData();