// Users Document Schema
var mongoose = require("mongoose");
var bcrypt = require("bcrypt")

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        name: {type: String, required: true, unique: true, trim:true},
        actualName: {type: String, required: true, trim:true},
        password: {type: String, required: true},
        email: {type: String, required: true, unique: true, trim:true, lowercase: true},
        university: {type: String, required: true, trim:true},
        campus: {type: String, trim:true},
        phone: {type: String, trim:true},
        karma: {type: Number, default: 100},
        isAdmin: {type: Boolean, default: false},
        isVerifiedStudent: {type: Boolean, default: false},
        products: [{type: Schema.Types.ObjectId, ref: 'Product'}],
        savedProducts: [{type: Schema.Types.ObjectId, ref: 'Product'}],
        profilePic: {type: Buffer}
    }, {timestamps: true}
);

UserSchema
.virtual('url')
.get(function () {
    return 'users/' + this._id;
});

UserSchema.methods.validatePassword = async function (x) {
    return await bcrypt.compare(x, this.password) //x is the possible password being checked
}

module.exports = mongoose.model('User', UserSchema);