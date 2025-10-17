// Order Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var OrderSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['pending_meetup', 'completed', 'cancelled'], default: 'pending_meetup' },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'USD' },
        meetup: {
            time: { type: Date },
            campus: { type: String, trim: true },
            locationDetail: { type: String, trim: true },
            notes: { type: String, trim: true, maxLength: 1000 }
        }
    }, { timestamps: true }
);

OrderSchema
.virtual('url')
.get(function () {
    return 'orders/' + this._id;
});

module.exports = mongoose.model('Order', OrderSchema);


