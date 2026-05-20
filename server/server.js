// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const ProductModel = require('./models/products');
const UserModel = require('./models/users');
const CategoryModel = require('./models/category');
const ConversationModel = require('./models/conversation');
const MessageModel = require('./models/message');
const OfferModel = require('./models/offer');
const OrderModel = require('./models/order');
const NotificationModel = require('./models/notification');
const ReviewModel = require('./models/review');
const ReportModel = require('./models/report');
const {
    checkRateLimit,
    buildDeviceFingerprint,
    deriveGeoFromIp,
    getRequestIp,
    loginRiskSummary,
    updateKnownDevice,
    createMfaChallenge,
    verifyMfaChallenge,
    checkTransactionVelocity,
    detectTriangulationFraud,
    placeSellerPayoutHold,
    safeHash
} = require('./services/security');
const { createManagedPaymentIntent, pauseSellerPayouts } = require('./services/stripe');
const { signalHouse } = require('./services/signalhouse');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only images allowed'));
    }
});

const app = express();
const port = 8000;
const bcrypt = require('bcrypt')
const LISTING_DURATION_DAYS = Number(process.env.LISTING_DURATION_DAYS || 30);
const LISTING_BUMP_COOLDOWN_HOURS = Number(process.env.LISTING_BUMP_COOLDOWN_HOURS || 24);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));


app.get("/", function (req, res) {
    res.send("meep");
});

app.listen(port, () => {console.log("Server listening on port 8000...");});

const mongoose=require('mongoose')

const mongoDB = 'mongodb://127.0.0.1:27017/shopredlive';
mongoose.connect(mongoDB);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return undefined;
}

function computeExpiresAt() {
    return new Date(Date.now() + LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

async function expireListings() {
    const now = new Date();
    await ProductModel.updateMany(
        { status: 'active', expiresAt: { $lte: now } },
        { $set: { status: 'expired' } }
    );
}

function buildProductSearchQuery(params) {
    const query = { status: 'active' };
    const now = new Date();
    query.$or = [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }];

    const q = params.q;
    if (q) {
        query.$and = query.$and || [];
        query.$and.push({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        });
    }

    if (params.category) query.category = params.category;
    if (params.condition) query.condition = params.condition;
    if (params.campus) query['location.campus'] = { $regex: params.campus, $options: 'i' };

    const allowsMeetup = parseBoolean(params.allowsMeetup);
    if (typeof allowsMeetup === 'boolean') query.allowsMeetup = allowsMeetup;
    const allowsShipping = parseBoolean(params.allowsShipping);
    if (typeof allowsShipping === 'boolean') query.allowsShipping = allowsShipping;

    if (params.minPrice || params.maxPrice) {
        query.price = {};
        if (params.minPrice) query.price.$gte = parseFloat(params.minPrice);
        if (params.maxPrice) query.price.$lte = parseFloat(params.maxPrice);
    }

    return query;
}

async function encrypt(password) { //uses bcrypt and salt
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

//all 

app.get("/db", async (req,res) => {
    try {
        const products = await ProductModel.find()
            .populate({
                path: 'seller',
                select: 'name actualName profilePic email'
            })
            .populate({
                path: 'buyer',
                select: 'name actualName profilePic email'
            })
            .populate({
                path: 'category',
                select: 'name'
            })
            .exec()
        const users = await UserModel.find()
            .select('-password -passwordResetTokenHash -passwordResetExpiresAt -mfa.codeHash')
            .populate("products savedProducts")
            .exec()
        const resp = {
            products: products,
            users: users
        }
        console.log(1)
        res.json(resp)
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch database', details: err.message })
    }
})

app.get("/products", async (req, res) => {
    try {
        await expireListings();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || 'newest';
        const skip = (page - 1) * limit;
        const query = buildProductSearchQuery({});
        let sortObj = { bumpedAt: -1, createdAt: -1 };
        if (sort === 'price_asc') sortObj = { price: 1 };
        else if (sort === 'price_desc') sortObj = { price: -1 };
        else if (sort === 'oldest') sortObj = { createdAt: 1 };
        else if (sort === 'most_viewed') sortObj = { views: -1 };
        else if (sort === 'ending_soon') sortObj = { expiresAt: 1, createdAt: -1 };

        const products = await ProductModel.find(query)
            .populate({
                path: 'seller',
                select: 'name actualName profilePic'
            })
            .populate({
                path: 'category',
                select: 'name'
            })
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await ProductModel.countDocuments(query);
        res.json({ products, total, page, pages: Math.ceil(total / limit) });
    } catch(err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await UserModel.find()
            .select('-password -passwordResetTokenHash -passwordResetExpiresAt -mfa.codeHash')
            .populate("products savedProducts")
            .exec()
        res.json(users)
    } catch(err) {
        console.error(err);
        res.sendStatus(500)
    }
});

app.get("/user/:id", async (req, res) => {
    try {
        let user = await UserModel.findById(req.params['id'])
            .select('-password -passwordResetTokenHash -passwordResetExpiresAt -mfa.codeHash')
            .populate("products savedProducts")
            .lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.get("/user/:id/devices", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).select('knownDevices').lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.knownDevices || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

app.patch("/user/:id/devices/revoke", async (req, res) => {
    try {
        const { fingerprint } = req.body || {};
        if (!fingerprint) return res.status(400).json({ error: 'Fingerprint is required' });
        const user = await UserModel.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const device = user.knownDevices?.find((entry) => entry.fingerprint === fingerprint);
        if (!device) return res.status(404).json({ error: 'Device not found' });
        device.trusted = false;
        device.lastSeenAt = new Date();
        await user.save();
        res.json({ success: true, device });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke device' });
    }
});

app.get("/users/verify", async (req,res) => {
    const {name, email} = req.query
    const q = {name: name, email: email}
    const user = await UserModel.findOne(q).exec()
    if(!user) return res.json({ans: false})
    return res.json({ans:true})
})

app.post("/users/verify-login", async (req,res) => {
    try {
        const rate = checkRateLimit({ req, name: 'backend-login', windowMs: 15 * 60 * 1000, max: 8 });
        if (!rate.allowed) {
            return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
        }

        const { email, password, mfaCode, mfaChallengeId } = req.body;
        const user = await UserModel.findOne({ email: String(email || '').trim().toLowerCase() }).exec();
        if (!user) {
            return res.status(401).json({ validEmail: false, validPassword: false });
        }

        if (user.isLocked()) {
            return res.status(423).json({ error: 'Account locked', lockedUntil: user.lockUntil });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
            }
            await user.save();
            return res.status(401).json({ validEmail: true, validPassword: false });
        }

        const ip = getRequestIp(req);
        const deviceFingerprint = buildDeviceFingerprint(req);
        const geo = deriveGeoFromIp(ip);
        const risk = loginRiskSummary(user, { ip, geo, deviceFingerprint });
        const deviceIsKnown = Array.isArray(user.knownDevices)
            && user.knownDevices.some((device) => device.fingerprint === deviceFingerprint && device.trusted !== false);

        if (risk.requireMfa) {
            if (!mfaChallengeId || !mfaCode) {
                const challenge = createMfaChallenge(user, { reason: risk.geoShift ? 'geo_anomaly' : 'unrecognized_device' });
                await user.save();
                await NotificationModel.create({
                    recipient: user._id,
                    type: 'system',
                    title: 'Login verification code',
                    body: `Your verification code is ${challenge.code}.`,
                    data: { challengeId: challenge.challengeId }
                });
                return res.json({ mfaRequired: true, mfaChallengeId: challenge.challengeId });
            }

            const mfaCheck = verifyMfaChallenge(user, mfaChallengeId, mfaCode);
            if (!mfaCheck.valid) {
                return res.status(401).json({ mfaRequired: true, error: 'Invalid MFA code' });
            }
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        updateKnownDevice(user, {
            deviceFingerprint,
            ip,
            geo,
            userAgent: req.headers['user-agent'] || '',
            deviceLabel: req.headers['sec-ch-ua-platform'] || 'Browser'
        });
        await user.save();

        if (!deviceIsKnown) {
            await NotificationModel.create({
                recipient: user._id,
                type: 'system',
                title: 'New device sign-in detected',
                body: `We noticed a sign-in from a new device (${req.headers['sec-ch-ua-platform'] || 'Browser'}).`,
                data: { ip, geo }
            });
        }

        return res.json({ validEmail: true, validPassword: true, userId: user._id, user: (() => { const plain = user.toObject(); delete plain.password; return plain; })() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Login failed' });
    }
})

// extra post methods from my previous code files for other assignments in case I can restructure them for later in development

// app.post("/upvote-post", async (req,res) => {
//     const {postID, userID} = req.body
//     await PostModel.updateOne({_id: postID}, {$inc: {votes: 1}})
//     await UserModel.updateOne({_id: userID} , {$inc: {karma: 5}})
//     res.send(true)
// })

// app.post("/downvote-post", async (req,res) => {
//     const {postID, userID} = req.body
//     await PostModel.updateOne({_id: postID}, {$inc: {votes: -1}})
//     await UserModel.updateOne({_id: userID} , {$inc: {karma: -10}})
//     res.send(true)
// })

// app.post("/upvote-comment", async (req,res) => {
//     const {commentID, userID} = req.body
//     await CommentModel.updateOne({_id: commentID}, {$inc: {votes: 1}})
//     await UserModel.updateOne({_id: userID} , {$inc: {karma: 5}})
//     res.send(true)
// })

// app.post("/downvote-comment", async (req,res) => {
//     const {commentID, userID} = req.body
//     await CommentModel.updateOne({_id: commentID}, {$inc: {votes: -1}})
//     await UserModel.updateOne({_id: userID} , {$inc: {karma: -10}})
//     res.send(true)
// })

// app.post("/join-community", async (req,res) => {
//     const {communityID, userID} = req.body
//     await CommunityModel.updateOne({_id: communityID}, {$push: {members: userID}})
//     await UserModel.updateOne({_id: userID}, {$push: {communities: communityID}})
//     return {success:true}
// })

// app.post("/leave-community", async (req,res) => {
//     const {communityID, userID} = req.body
//     await UserModel.updateOne({ _id: userID }, { $pull: { communities: communityID } })
//     await CommunityModel.updateOne({ _id: communityID }, { $pull: { members: userID } });
//     console.log("yeooo")
//     return { success: true };
// })
//home page
app.get("/home/new", async (req, res) => {
    let products = await ProductModel.find({soldOrNot: false}).sort({postedDate: -1}).exec();
    res.send(products);
});

app.get("/home/old", async (req, res) => {
    let products = await ProductModel.find({soldOrNot: false}).sort({postedDate: 1}).exec();
    res.send(products);
});
//end home page
function isSbuEmail(email) {
    return email.toLowerCase().endsWith('@stonybrook.edu') ||
           email.toLowerCase().endsWith('.stonybrook.edu');
}

app.post('/register', async (req, res) => {
    try {
        const { first, last, username, email, password, img } = req.body;
        const isVerified = isSbuEmail(email);
        const hashword = await encrypt(password);
        const user = new UserModel({
            name: username,
            actualName: first + ' ' + last,
            email: email,
            password: hashword,
            university: 'Stony Brook University',
            isAdmin: false,
            karma: 100,
            products: [],
            savedProducts: [],
            profilePic: img,
            isVerifiedStudent: isVerified,
            lastLoginIp: getRequestIp(req),
            lastLoginGeo: deriveGeoFromIp(getRequestIp(req)),
            knownDevices: [{
                fingerprint: buildDeviceFingerprint(req),
                label: req.headers['sec-ch-ua-platform'] || 'Browser',
                userAgent: req.headers['user-agent'] || '',
                ip: getRequestIp(req),
                geo: deriveGeoFromIp(getRequestIp(req))
            }]
        });
        await user.save();
        res.json({ success: true, isVerifiedStudent: isVerified, userId: user._id });
    } catch (error) {
        console.error("User cannot be registered", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.get("/product/:id", async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
            .populate({
                path: 'seller',
                select: 'name actualName profilePic email karma isVerifiedStudent responseTimeAvgMinutes responseTimeCount'
            })
            .populate({
                path: 'buyer',
                select: 'name actualName profilePic email'
            })
            .populate({
                path: 'category',
                select: 'name'
            })
            .lean();

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product', details: error.message });
    }
});

app.get("/products/seller/:sellerId", async (req, res) => {
    try {
        await expireListings();
        const sellerId = req.params.sellerId;
        const limit = parseInt(req.query.limit) || 6;
        const products = await ProductModel.find({
            seller: sellerId,
            status: 'active',
            $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }]
        })
            .sort({ bumpedAt: -1, createdAt: -1 })
            .limit(limit)
            .lean();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch seller products' });
    }
});

app.get("/products/related/:id", async (req, res) => {
    try {
        await expireListings();
        const product = await ProductModel.findById(req.params.id).lean();
        if (!product) return res.status(404).json({ error: 'Product not found' });
        const limit = parseInt(req.query.limit) || 6;
        const priceMin = Number(product.price) * 0.7;
        const priceMax = Number(product.price) * 1.3;
        const related = await ProductModel.find({
            _id: { $ne: product._id },
            status: 'active',
            category: product.category,
            price: { $gte: priceMin, $lte: priceMax },
            $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }]
        })
            .sort({ bumpedAt: -1, createdAt: -1 })
            .limit(limit)
            .lean();
        res.json(related);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch related products' });
    }
});

// Update a product by ID
app.patch("/product/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const updateData = req.body || {};

        const existingProduct = await ProductModel.findById(productId).lean();
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        delete updateData.seller;
        delete updateData.buyer;
        delete updateData.views;

        const nextPrice = typeof updateData.price === 'number' ? updateData.price : undefined;
        const priceDropped = typeof nextPrice === 'number' && nextPrice < Number(existingProduct.price || 0);
        const nextStatus = updateData.status;
        const statusChanged = nextStatus && nextStatus !== existingProduct.status;

        // Only update the fields that are provided in the request
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true } // Return the updated document and run schema validation
        ).populate('seller buyer');

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (priceDropped) {
            const watchers = await UserModel.find({ savedProducts: productId }).select('_id').lean();
            if (watchers.length) {
                await NotificationModel.insertMany(
                    watchers.map((watcher) => ({
                        recipient: watcher._id,
                        type: 'system',
                        title: 'Price drop alert',
                        body: `${updatedProduct.name} dropped from $${existingProduct.price} to $${updatedProduct.price}.`,
                        data: { productId }
                    }))
                );
            }
        }

        if (statusChanged) {
            const watchers = await UserModel.find({ savedProducts: productId }).select('_id').lean();
            if (watchers.length) {
                await NotificationModel.insertMany(
                    watchers.map((watcher) => ({
                        recipient: watcher._id,
                        type: 'system',
                        title: 'Listing status updated',
                        body: `${updatedProduct.name} is now ${nextStatus}.`,
                        data: { productId, status: nextStatus }
                    }))
                );
            }
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.post("/product/:id/renew", async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (product.status === 'sold' || product.status === 'removed') {
            return res.status(400).json({ error: 'Cannot renew a closed listing' });
        }
        product.status = 'active';
        product.expiresAt = computeExpiresAt();
        product.bumpedAt = new Date();
        await product.save();
        const watchers = await UserModel.find({ savedProducts: product._id }).select('_id').lean();
        if (watchers.length) {
            await NotificationModel.insertMany(
                watchers.map((watcher) => ({
                    recipient: watcher._id,
                    type: 'system',
                    title: 'Listing renewed',
                    body: `${product.name} is active again.`,
                    data: { productId: product._id }
                }))
            );
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to renew listing' });
    }
});

app.post("/product/:id/bump", async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (product.status !== 'active') {
            return res.status(400).json({ error: 'Only active listings can be bumped' });
        }

        const lastBump = product.bumpedAt || product.createdAt;
        const nextAllowed = new Date(lastBump.getTime() + LISTING_BUMP_COOLDOWN_HOURS * 60 * 60 * 1000);
        if (nextAllowed.getTime() > Date.now()) {
            return res.status(429).json({
                error: 'Bump cooldown active',
                nextAllowed
            });
        }

        product.bumpedAt = new Date();
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to bump listing' });
    }
});

// Delete a product by ID
app.delete("/product/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        const deletedProduct = await ProductModel.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Remove the product from the seller's products array
        await UserModel.updateOne(
            { products: productId },
            { $pull: { products: productId } }
        );

        res.json(deletedProduct);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.post("/newProduct", async (req, res) => {
    const { product } = req.body;
    console.log(product);

    // Validate required fields
    if (!product.name || !product.description || typeof product.price === 'undefined' || product.price === null) {
        return res.status(400).json({ error: 'Name, description, and price are required' });
    }

    let newProduct = new ProductModel({
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency || 'USD',
        seller: product.seller,
        buyer: product.buyer || null,
        images: product.images || [],
        category: product.category || null,
        condition: product.condition || 'good',
        tags: product.tags || [],
        location: product.location || { campus: '', area: '' },
        status: product.status || 'active',
        negotiable: typeof product.negotiable === 'boolean' ? product.negotiable : true,
        allowsMeetup: typeof product.allowsMeetup === 'boolean' ? product.allowsMeetup : true,
        allowsShipping: typeof product.allowsShipping === 'boolean' ? product.allowsShipping : false,
        views: product.views || 0,
        expiresAt: product.expiresAt ? new Date(product.expiresAt) : computeExpiresAt(),
        bumpedAt: new Date()
    });

    const savedProduct = await newProduct.save();

    await UserModel.updateOne({_id: product.seller}, {$push: {'products': savedProduct._id}});

    res.json(savedProduct)
});

app.post("/product/:id/view", async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ views: product.views });
    } catch (error) {
        res.status(500).json({ error: 'Failed to increment views' });
    }
});

app.post("/upload", upload.array('images', 10), async (req, res) => {
    try {
        const urls = req.files.map(file => `/uploads/${file.filename}`);
        res.json({ urls });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.get("/categories", async (req, res) => {
    try {
        const categories = await CategoryModel.find().sort({ name: 1 }).lean();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post("/categories", async (req, res) => {
    try {
        const { name } = req.body;
        const category = new CategoryModel({ name });
        await category.save();
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.post("/user/:id/save-product", async (req, res) => {
    try {
        const { productId } = req.body;
        await UserModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { savedProducts: productId } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save product' });
    }
});

app.post("/user/:id/unsave-product", async (req, res) => {
    try {
        const { productId } = req.body;
        await UserModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { savedProducts: productId } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unsave product' });
    }
});

app.patch("/user/:id", async (req, res) => {
    try {
        const updateData = req.body;
        delete updateData.password;
        delete updateData.isAdmin;
        const user = await UserModel.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("products savedProducts");
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.get("/user/:id/saved-searches", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).select('savedSearches').lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.savedSearches || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch saved searches' });
    }
});

app.post("/user/:id/saved-searches", async (req, res) => {
    try {
        const { name, query, filters } = req.body || {};
        if (!query && !filters) {
            return res.status(400).json({ error: 'Query or filters are required' });
        }
        const user = await UserModel.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const savedSearch = {
            id: `search_${Math.random().toString(36).slice(2, 10)}`,
            name: name || query || 'Saved search',
            query: query || '',
            filters: {
                category: filters?.category || null,
                condition: filters?.condition || '',
                minPrice: filters?.minPrice ?? null,
                maxPrice: filters?.maxPrice ?? null,
                campus: filters?.campus || '',
                allowsMeetup: typeof filters?.allowsMeetup === 'boolean' ? filters.allowsMeetup : undefined,
                allowsShipping: typeof filters?.allowsShipping === 'boolean' ? filters.allowsShipping : undefined
            },
            createdAt: new Date(),
            lastCheckedAt: new Date()
        };

        user.savedSearches = Array.isArray(user.savedSearches) ? user.savedSearches : [];
        user.savedSearches.push(savedSearch);
        await user.save();

        res.json(savedSearch);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save search' });
    }
});

app.delete("/user/:id/saved-searches/:searchId", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const beforeCount = user.savedSearches?.length || 0;
        user.savedSearches = (user.savedSearches || []).filter((search) => search.id !== req.params.searchId);
        if (user.savedSearches.length === beforeCount) {
            return res.status(404).json({ error: 'Saved search not found' });
        }
        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove saved search' });
    }
});

app.post("/user/:id/saved-searches/:searchId/run", async (req, res) => {
    try {
        await expireListings();
        const user = await UserModel.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const savedSearch = (user.savedSearches || []).find((search) => search.id === req.params.searchId);
        if (!savedSearch) return res.status(404).json({ error: 'Saved search not found' });

        const queryParams = {
            q: savedSearch.query,
            category: savedSearch.filters?.category || undefined,
            condition: savedSearch.filters?.condition || undefined,
            minPrice: savedSearch.filters?.minPrice || undefined,
            maxPrice: savedSearch.filters?.maxPrice || undefined,
            campus: savedSearch.filters?.campus || undefined,
            allowsMeetup: savedSearch.filters?.allowsMeetup,
            allowsShipping: savedSearch.filters?.allowsShipping
        };

        const query = buildProductSearchQuery(queryParams);
        if (savedSearch.lastCheckedAt) {
            query.createdAt = { $gt: savedSearch.lastCheckedAt };
        }

        const matches = await ProductModel.find(query)
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        savedSearch.lastCheckedAt = new Date();
        await user.save();

        if (matches.length) {
            await NotificationModel.create({
                recipient: user._id,
                type: 'system',
                title: 'Saved search matches',
                body: `We found ${matches.length} new listing${matches.length === 1 ? '' : 's'} for "${savedSearch.name}".`,
                data: { searchId: savedSearch.id, matchCount: matches.length }
            });
        }

        res.json({ matches });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run saved search' });
    }
});

app.get("/conversations/:userId", async (req, res) => {
    try {
        const conversations = await ConversationModel.find({
            participants: req.params.userId
        })
        .populate('participants', 'name actualName profilePic')
        .populate('product', 'name images price')
        .sort({ lastMessageAt: -1 })
        .lean();
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

app.post("/conversations", async (req, res) => {
    try {
        const { participants, productId } = req.body;
        let conversation = await ConversationModel.findOne({
            participants: { $all: participants, $size: participants.length },
            product: productId
        });
        if (!conversation) {
            conversation = new ConversationModel({
                participants,
                product: productId
            });
            await conversation.save();
            const channelId = `conv_${conversation._id}`;
            try {
                await signalHouse.createChannel(channelId, participants);
            } catch (e) {
                console.log('SignalHouse channel creation skipped:', e.message);
            }
        }
        await conversation.populate('participants', 'name actualName profilePic');
        await conversation.populate('product', 'name images price');
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

app.get("/conversation/:id/messages", async (req, res) => {
    try {
        const { limit = 50, before } = req.query;
        const query = { conversation: req.params.id };
        if (before) query.createdAt = { $lt: new Date(before) };
        const messages = await MessageModel.find(query)
            .populate('sender', 'name actualName profilePic')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();
        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.post("/conversation/:id/messages", async (req, res) => {
    try {
        const { senderId, body } = req.body;
        const message = new MessageModel({
            conversation: req.params.id,
            sender: senderId,
            body,
            readBy: [senderId]
        });
        await message.save();
        await ConversationModel.findByIdAndUpdate(req.params.id, {
            lastMessageAt: new Date(),
            lastMessage: body.substring(0, 100)
        });
        const channelId = `conv_${req.params.id}`;
        try {
            await signalHouse.sendMessage(channelId, senderId, body);
        } catch (e) {
            console.log('SignalHouse message send skipped:', e.message);
        }
        const conversation = await ConversationModel.findById(req.params.id).populate('product', 'seller');
        const recipientId = conversation.participants.find(p => p.toString() !== senderId);
        if (recipientId) {
            const notification = new NotificationModel({
                recipient: recipientId,
                type: 'message',
                title: 'New Message',
                body: body.substring(0, 100),
                data: { conversationId: req.params.id, messageId: message._id }
            });
            await notification.save();
        }

        const sellerId = conversation.product?.seller?.toString?.() || String(conversation.product?.seller || '');
        if (sellerId && String(senderId) === String(sellerId)) {
            const lastBuyerMessage = await MessageModel.findOne({
                conversation: req.params.id,
                sender: { $ne: senderId }
            }).sort({ createdAt: -1 }).lean();

            if (lastBuyerMessage?.createdAt) {
                const diffMinutes = Math.max(0, (message.createdAt - lastBuyerMessage.createdAt) / 60000);
                const seller = await UserModel.findById(sellerId);
                if (seller) {
                    const count = Number(seller.responseTimeCount || 0);
                    const currentAvg = Number(seller.responseTimeAvgMinutes || 0);
                    const nextAvg = count ? ((currentAvg * count) + diffMinutes) / (count + 1) : diffMinutes;
                    seller.responseTimeAvgMinutes = Number(nextAvg.toFixed(2));
                    seller.responseTimeCount = count + 1;
                    await seller.save();
                }
            }
        }
        await message.populate('sender', 'name actualName profilePic');
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.post("/conversation/:id/read", async (req, res) => {
    try {
        const { userId } = req.body;
        await MessageModel.updateMany(
            { conversation: req.params.id, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

app.get("/offers/user/:userId", async (req, res) => {
    try {
        await OfferModel.updateMany(
            { status: 'pending', expiresAt: { $lte: new Date() } },
            { $set: { status: 'expired' } }
        );
        const offers = await OfferModel.find({
            $or: [{ buyer: req.params.userId }, { seller: req.params.userId }]
        })
        .populate('product', 'name images price')
        .populate('buyer', 'name actualName profilePic')
        .populate('seller', 'name actualName profilePic')
        .sort({ createdAt: -1 })
        .lean();
        res.json(offers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
});

app.post("/offers", async (req, res) => {
    try {
        const { productId, buyerId, amount, message } = req.body;
        const numericAmount = Number(amount);
        if (!productId || !buyerId || Number.isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ error: 'Invalid offer details' });
        }

        const product = await ProductModel.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (String(product.seller) === String(buyerId)) {
            return res.status(400).json({ error: 'Cannot make an offer on your own listing' });
        }
        if (product.status !== 'active' || (product.expiresAt && product.expiresAt <= new Date())) {
            return res.status(400).json({ error: 'Offers are closed for this listing' });
        }

        const existing = await OfferModel.findOne({ product: productId, buyer: buyerId, status: 'pending' });
        if (existing) {
            return res.status(400).json({ error: 'You already have a pending offer on this listing' });
        }
        const offer = new OfferModel({
            product: productId,
            buyer: buyerId,
            seller: product.seller,
            amount: numericAmount,
            message,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await offer.save();
        const notification = new NotificationModel({
            recipient: product.seller,
            type: 'offer',
            title: 'New Offer Received',
            body: `You received an offer of $${amount} for ${product.name}`,
            data: { offerId: offer._id, productId }
        });
        await notification.save();
        await offer.populate('product', 'name images price');
        await offer.populate('buyer', 'name actualName profilePic');
        res.json(offer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create offer' });
    }
});

app.patch("/offers/:id", async (req, res) => {
    try {
        const { status, actorId } = req.body;
        const allowed = ['accepted', 'declined', 'withdrawn'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: 'Invalid offer status' });
        }

        const offer = await OfferModel.findById(req.params.id)
            .populate('product', 'name images price seller')
            .populate('buyer', 'name actualName profilePic')
            .populate('seller', 'name actualName profilePic');

        if (!offer) return res.status(404).json({ error: 'Offer not found' });

        if (offer.status !== 'pending') {
            return res.status(400).json({ error: `Offer already ${offer.status}` });
        }

        if (offer.expiresAt && offer.expiresAt <= new Date()) {
            offer.status = 'expired';
            await offer.save();
            return res.status(400).json({ error: 'Offer expired' });
        }

        if (status === 'withdrawn' && String(actorId) !== String(offer.buyer?._id)) {
            return res.status(403).json({ error: 'Only the buyer can withdraw this offer' });
        }

        if ((status === 'accepted' || status === 'declined') && String(actorId) !== String(offer.seller?._id)) {
            return res.status(403).json({ error: 'Only the seller can update this offer' });
        }

        offer.status = status;
        await offer.save();

        const buyerNotification = new NotificationModel({
            recipient: offer.buyer,
            type: 'offer',
            title: `Offer ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            body: `Your offer for ${offer.product.name} was ${status}`,
            data: { offerId: offer._id, productId: offer.product._id }
        });
        await buyerNotification.save();

        if (status === 'withdrawn') {
            await NotificationModel.create({
                recipient: offer.seller,
                type: 'offer',
                title: 'Offer withdrawn',
                body: `${offer.buyer?.actualName || 'A buyer'} withdrew their offer on ${offer.product.name}.`,
                data: { offerId: offer._id, productId: offer.product._id }
            });
        }

        if (status === 'accepted') {
            const order = new OrderModel({
                product: offer.product._id,
                buyer: offer.buyer._id,
                seller: offer.seller._id,
                price: offer.amount,
                currency: offer.currency,
                status: 'pending_payment',
                payment: { provider: 'stripe' }
            });
            await order.save();
            await ProductModel.findByIdAndUpdate(offer.product._id, { status: 'reserved' });
        }

        res.json(offer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update offer' });
    }
});

app.get("/orders/user/:userId", async (req, res) => {
    try {
        const orders = await OrderModel.find({
            $or: [{ buyer: req.params.userId }, { seller: req.params.userId }]
        })
        .populate('product', 'name images price')
        .populate('buyer', 'name actualName profilePic')
        .populate('seller', 'name actualName profilePic')
        .sort({ createdAt: -1 })
        .lean();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.patch("/orders/:id", async (req, res) => {
    try {
        const updateData = req.body || {};
        const actorId = updateData.actorId;
        delete updateData.actorId;

        const order = await OrderModel.findById(req.params.id)
            .populate('product', 'name images price')
            .populate('buyer', 'name actualName profilePic email phone')
            .populate('seller', 'name actualName profilePic email phone');

        if (!order) return res.status(404).json({ error: 'Order not found' });

        const previousStatus = order.status;
        if (updateData.meetup) {
            order.meetup = {
                time: updateData.meetup.time ? new Date(updateData.meetup.time) : order.meetup?.time,
                campus: updateData.meetup.campus || order.meetup?.campus,
                locationDetail: updateData.meetup.locationDetail || order.meetup?.locationDetail,
                notes: updateData.meetup.notes || order.meetup?.notes
            };
            order.status = 'pending_meetup';
        }

        if (updateData.status) {
            order.status = updateData.status;
        }

        await order.save();

        const counterpartId = actorId
            ? (String(actorId) === String(order.buyer?._id)
                ? order.seller?._id
                : order.buyer?._id)
            : null;

        if (updateData.meetup && counterpartId) {
            await NotificationModel.create({
                recipient: counterpartId,
                type: 'order',
                title: 'Meetup scheduled',
                body: `A meetup was scheduled for ${order.product?.name || 'your order'}.`,
                data: { orderId: order._id, meetup: order.meetup }
            });
        }

        if (previousStatus !== order.status && counterpartId) {
            await NotificationModel.create({
                recipient: counterpartId,
                type: 'order',
                title: `Order ${order.status.replace('_', ' ')}`,
                body: `Order status updated for ${order.product?.name || 'your order'}.`,
                data: { orderId: order._id, status: order.status }
            });
        }

        if (order.status === 'completed') {
            await ProductModel.findByIdAndUpdate(order.product._id, {
                status: 'sold',
                buyer: order.buyer._id
            });
        }

        if (order.status === 'disputed' || order.status === 'refunded') {
            await pauseSellerPayouts(UserModel, order.seller, order.status === 'refunded' ? 'refund_requested' : 'order_disputed', 14);
            await NotificationModel.create({
                recipient: order.seller._id,
                type: 'system',
                title: order.status === 'refunded' ? 'Refund requested' : 'Order disputed',
                body: `Payouts for order ${order._id} are on hold pending review.`,
                data: { orderId: order._id, status: order.status }
            });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

app.post("/orders/:id/contact-share", async (req, res) => {
    try {
        const { actorId } = req.body || {};
        const order = await OrderModel.findById(req.params.id)
            .populate('buyer', 'email phone actualName')
            .populate('seller', 'email phone actualName');

        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (!actorId) return res.status(400).json({ error: 'Actor is required' });

        if (!order.contactExchange) {
            order.contactExchange = {};
        }

        let recipientId = null;
        if (String(actorId) === String(order.buyer?._id)) {
            order.contactExchange.buyerShared = true;
            order.contactExchange.buyerEmail = order.buyer?.email || '';
            order.contactExchange.buyerPhone = order.buyer?.phone || '';
            recipientId = order.seller?._id;
        } else if (String(actorId) === String(order.seller?._id)) {
            order.contactExchange.sellerShared = true;
            order.contactExchange.sellerEmail = order.seller?.email || '';
            order.contactExchange.sellerPhone = order.seller?.phone || '';
            recipientId = order.buyer?._id;
        } else {
            return res.status(403).json({ error: 'Only order participants can share contact info' });
        }

        if (order.contactExchange.buyerShared && order.contactExchange.sellerShared && !order.contactExchange.sharedAt) {
            order.contactExchange.sharedAt = new Date();
        }

        await order.save();

        if (recipientId) {
            await NotificationModel.create({
                recipient: recipientId,
                type: 'order',
                title: 'Contact info shared',
                body: 'The other party shared their contact details for this order.',
                data: { orderId: order._id }
            });
        }

        res.json({ success: true, contactExchange: order.contactExchange });
    } catch (error) {
        res.status(500).json({ error: 'Failed to share contact info' });
    }
});

app.get("/notifications/:userId", async (req, res) => {
    try {
        const notifications = await NotificationModel.find({ recipient: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

app.patch("/notifications/:id/read", async (req, res) => {
    try {
        await NotificationModel.findByIdAndUpdate(req.params.id, { readAt: new Date() });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

app.post("/notifications/read-all", async (req, res) => {
    try {
        const { userId } = req.body;
        await NotificationModel.updateMany(
            { recipient: userId, readAt: null },
            { readAt: new Date() }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

app.get("/reviews/user/:userId", async (req, res) => {
    try {
        const reviews = await ReviewModel.find({ reviewee: req.params.userId })
            .populate('reviewer', 'name actualName profilePic')
            .populate('order', 'product')
            .sort({ createdAt: -1 })
            .lean();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.post("/reviews", async (req, res) => {
    try {
        const { reviewerId, revieweeId, orderId, rating, comment } = req.body;
        if (orderId) {
            const existingReview = await ReviewModel.findOne({ reviewer: reviewerId, order: orderId });
            if (existingReview) {
                return res.status(400).json({ error: 'Review already submitted for this order' });
            }
            const order = await OrderModel.findById(orderId).lean();
            if (order && order.status !== 'completed') {
                return res.status(400).json({ error: 'Reviews are only allowed after completion' });
            }
        }
        const review = new ReviewModel({
            reviewer: reviewerId,
            reviewee: revieweeId,
            order: orderId,
            rating,
            comment
        });
        await review.save();
        const karmaChange = rating >= 4 ? 10 : rating >= 3 ? 0 : -10;
        await UserModel.findByIdAndUpdate(revieweeId, { $inc: { karma: karmaChange } });
        await review.populate('reviewer', 'name actualName profilePic');
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create review' });
    }
});

app.post("/reports", async (req, res) => {
    try {
        const { reporterId, targetUserId, targetProductId, reason, details } = req.body;
        const report = new ReportModel({
            reporter: reporterId,
            targetUser: targetUserId,
            targetProduct: targetProductId,
            reason,
            details
        });
        await report.save();
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create report' });
    }
});

app.patch("/reports/:id", async (req, res) => {
    try {
        const { status, note, moderator } = req.body || {};
        const updates = {};
        const allowedStatuses = ['open', 'reviewing', 'resolved', 'dismissed'];
        if (status && allowedStatuses.includes(status)) {
            updates.status = status;
        }

        const updateOps = {};
        if (Object.keys(updates).length) {
            updateOps.$set = updates;
        }
        if (note) {
            updateOps.$push = {
                moderatorNotes: {
                    note,
                    createdBy: moderator || 'system'
                }
            };
        }

        if (!Object.keys(updateOps).length) {
            return res.status(400).json({ error: 'No valid updates provided' });
        }

        const report = await ReportModel.findByIdAndUpdate(req.params.id, updateOps, { new: true });
        if (!report) return res.status(404).json({ error: 'Report not found' });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update report' });
    }
});

app.get("/products/search", async (req, res) => {
    try {
        await expireListings();
        const { sort, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = buildProductSearchQuery(req.query);
        let sortObj = { bumpedAt: -1, createdAt: -1 };
        if (sort === 'price_asc') sortObj = { price: 1 };
        else if (sort === 'price_desc') sortObj = { price: -1 };
        else if (sort === 'oldest') sortObj = { createdAt: 1 };
        else if (sort === 'most_viewed') sortObj = { views: -1 };
        else if (sort === 'ending_soon') sortObj = { expiresAt: 1, createdAt: -1 };
        const [products, total] = await Promise.all([
            ProductModel.find(query)
                .populate('seller', 'name actualName profilePic')
                .populate('category', 'name')
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            ProductModel.countDocuments(query)
        ]);
        res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to search products' });
    }
});
