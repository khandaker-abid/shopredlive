// Product Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new Schema(
    {
        name:{type: String, required: true, maxLength:100},
        description:{type: String, required: true, maxLength:2000},
        price: {type: Number, required:true, min: 0},
        currency: {type: String, default: 'USD'},
        seller:{type: Schema.Types.ObjectId, ref: 'User', required: true},
        buyer:{type: Schema.Types.ObjectId, ref: 'User'},
        images: [{type: Buffer}],
        category: {type: Schema.Types.ObjectId, ref: 'Category'},
        condition: {type: String, enum: ['new', 'like_new', 'good', 'fair', 'poor'], default: 'good'},
        tags: [{type: String, trim: true}],
        location: {
            campus: {type: String, trim: true},
            area: {type: String, trim: true}
        },
        status: {type: String, enum: ['active', 'reserved', 'sold', 'removed'], default: 'active'},
        negotiable: {type: Boolean, default: true},
        allowsMeetup: {type: Boolean, default: true},
        allowsShipping: {type: Boolean, default: false},
        views:{type:Number, default:0},
    }, {timestamps: true}
);

ProductSchema
.virtual('url')
.get(function () {
    return 'products/' + this._id;
});

module.exports = mongoose.model('Product', ProductSchema);