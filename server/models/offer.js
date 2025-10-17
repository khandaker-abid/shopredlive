// Offer Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var OfferSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'USD' },
        status: { type: String, enum: ['pending', 'accepted', 'declined', 'withdrawn', 'expired'], default: 'pending' },
        message: { type: String, trim: true, maxLength: 2000 },
        expiresAt: { type: Date }
    }, { timestamps: true }
);

OfferSchema
.virtual('url')
.get(function () {
    return 'offers/' + this._id;
});

module.exports = mongoose.model('Offer', OfferSchema);


