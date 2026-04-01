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
        const users = await UserModel.find().populate("products savedProducts").exec()
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const products = await ProductModel.find({ status: 'active' })
            .populate({
                path: 'seller',
                select: 'name actualName profilePic'
            })
            .populate({
                path: 'category',
                select: 'name'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await ProductModel.countDocuments({ status: 'active' });
        res.json({ products, total, page, pages: Math.ceil(total / limit) });
    } catch(err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await UserModel.find().populate("products savedProducts").exec()
        res.json(users)
    } catch(err) {
        console.error(err);
        res.sendStatus(500)
    }
});

app.get("/user/:id", async (req, res) => {
    try {
        let user = await UserModel.findById(req.params['id']).populate("products savedProducts").lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
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
    const {email, password} = req.body
    let q = {email: email}
    let user = await UserModel.findOne(q).exec()
    if(!user) res.json({validEmail:false, validPassword: false});
    const match = await bcrypt.compare(password, user.password)
    //this is the encryption decryption check
    if(!match) res.json({validEmail:true, validPassword:false})
    res.json({validEmail:true, validPassword: true, userId: user._id})
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
            isVerifiedStudent: isVerified
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

// Update a product by ID
app.patch("/product/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const updateData = req.body;

        // Only update the fields that are provided in the request
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true } // Return the updated document and run schema validation
        ).populate('seller buyer');

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
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
        views: product.views || 0
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
        const conversation = await ConversationModel.findById(req.params.id);
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
        const product = await ProductModel.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        const offer = new OfferModel({
            product: productId,
            buyer: buyerId,
            seller: product.seller,
            amount,
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
        const { status } = req.body;
        const offer = await OfferModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
        .populate('product', 'name images price')
        .populate('buyer', 'name actualName profilePic')
        .populate('seller', 'name actualName profilePic');
        if (!offer) return res.status(404).json({ error: 'Offer not found' });
        const notification = new NotificationModel({
            recipient: offer.buyer,
            type: 'offer',
            title: `Offer ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            body: `Your offer for ${offer.product.name} was ${status}`,
            data: { offerId: offer._id, productId: offer.product._id }
        });
        await notification.save();
        if (status === 'accepted') {
            const order = new OrderModel({
                product: offer.product._id,
                buyer: offer.buyer._id,
                seller: offer.seller._id,
                price: offer.amount,
                currency: offer.currency
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
        const updateData = req.body;
        const order = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        )
        .populate('product', 'name images price')
        .populate('buyer', 'name actualName profilePic')
        .populate('seller', 'name actualName profilePic');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (updateData.status === 'completed') {
            await ProductModel.findByIdAndUpdate(order.product._id, {
                status: 'sold',
                buyer: order.buyer._id
            });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
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

app.get("/products/search", async (req, res) => {
    try {
        const { q, category, condition, minPrice, maxPrice, sort, campus, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = { status: 'active' };
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ];
        }
        if (category) query.category = category;
        if (condition) query.condition = condition;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (campus) query['location.campus'] = { $regex: campus, $options: 'i' };
        let sortObj = { createdAt: -1 };
        if (sort === 'price_asc') sortObj = { price: 1 };
        else if (sort === 'price_desc') sortObj = { price: -1 };
        else if (sort === 'oldest') sortObj = { createdAt: 1 };
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
