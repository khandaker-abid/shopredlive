// Product Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new Schema(
    {
        name:{type: String, required: true, maxLength:100},
        description:{type: String, required: true, maxLength:1000},
        price: {type: Number, required:true},
        seller:{type: Schema.Types.ObjectId, ref: 'User', required: true},
        buyer:{type: Schema.Types.ObjectId, ref: 'User'},
        images: [{type:buffer}],
        soldOrNot: {type:Boolean, required: true},
        views:{type:Number, default:0, required: true},
    }, {timestamps: true}
);

ProductSchema
.virtual('url')
.get(function () {
    return 'products/' + this._id;
});

module.exports = mongoose.model('Product', ProductSchema);