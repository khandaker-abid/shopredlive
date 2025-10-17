// Review Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ReviewSchema = new Schema(
    {
        reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        order: { type: Schema.Types.ObjectId, ref: 'Order' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, maxLength: 2000 }
    }, { timestamps: true }
);

ReviewSchema
.virtual('url')
.get(function () {
    return 'reviews/' + this._id;
});

module.exports = mongoose.model('Review', ReviewSchema);


