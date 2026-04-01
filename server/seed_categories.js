const mongoose = require('mongoose');
const CategoryModel = require('./models/category');

const mongoDB = 'mongodb://127.0.0.1:27017/shopredlive';

const categories = [
    'Electronics',
    'Books',
    'Furniture',
    'Clothing',
    'Appliances',
    'Sports & Outdoors',
    'Home & Garden',
    'Art & Crafts',
    'Musical Instruments',
    'Vehicles',
    'Tickets',
    'School Supplies',
    'Dorm Essentials',
    'Other'
];

async function seedCategories() {
    try {
        await mongoose.connect(mongoDB);
        console.log('Connected to MongoDB');

        for (const name of categories) {
            const existing = await CategoryModel.findOne({ name });
            if (!existing) {
                await CategoryModel.create({ name });
                console.log(`Created category: ${name}`);
            } else {
                console.log(`Category exists: ${name}`);
            }
        }

        console.log('Categories seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
