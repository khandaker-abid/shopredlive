// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const ProductModel = require('./models/products');
const UserModel = require('./models/users');

const express = require('express');
const cors = require('cors');

const app = express();
const port = 8000;
const bcrypt = require('bcrypt')

app.use(cors());
app.use(express.json());


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
        const products = await ProductModel.find().populate('seller buyer').exec()
        const users = await UserModel.find().populate("products savedProducts").exec()
        const resp = {
            products: products,
            users: users
        }
        console.log(1)
        res.json(resp)
    } catch(err) {
        console.error(err);
        res.sendStatus(500)
    }
})

app.get("/products", async (req, res) => {
    try {
        const products = await ProductModel.find().populate('seller buyer').exec()
        res.json(posts);
    } catch(err) {
        console.error(err);
        res.sendStatus(500)
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
    let user = await UserModel.findById(req.params['id']).populate("products savedProducts").exec()
    res.json(user);
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
    let products = await RroductModel.find({soldOrNot: false}).sort({postedDate: 1}).exec();
    res.send(products);
});
//end home page
app.post('/register', async (req, res) => {
    try {
        //IMPLEMENT PROFILE PIC, IDK IF THIS WORKS
      const { first, last, username, email, password, img } = req.body;
      console.log(username)
      const hashword = await encrypt(password)
      const user = new UserModel({
        name: username,
        actualName: first+' '+last,
        email: email,
        password: hashword,
        isAdmin: false, 
        karma: 100, 
        products: [],
        savedProducts: [], 
        profilePic: img
      });
      await user.save();
    } catch (error) {
        console.error("User cannot be registered", error)
    }
    res.json({success: true})
});

app.get("/product/:id", async (req, res) => {
    let product = await productModel.findById(req.params.id).populate('seller buyer').exec();
    res.send(product);
});

app.post("/newProduct", async (req, res) => {
    const {product} = req.body
    console.log(product)
    let newProduct = new ProductModel({
        name: product.name,
        description: product.description,
        price:product.price,
        seller: product.seller,
        buyer: null,
        images: product.images,
        soldOrNot: false,
        views:0
    });
    const savedProduct = await newPost.save();

    await UserModel.updateOne({_id:product.seller},{$push:{'products':savedProduct._id}})

    res.send(savedProduct)
});
