// Order Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var OrderSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: [
                'pending_payment',
                'pending_shipment',
                'shipped',
                'delivered',
                'pending_meetup',
                'under_review',
                'completed',
                'cancelled',
                'disputed',
                'refunded'
            ],
            default: 'pending_payment'
        },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'USD' },
        shippingAddress: {
            line1: { type: String, trim: true },
            line2: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            postalCode: { type: String, trim: true },
            country: { type: String, trim: true }
        },
        buyerIp: { type: String, trim: true },
        buyerGeo: {
            country: { type: String, trim: true },
            region: { type: String, trim: true },
            city: { type: String, trim: true },
            source: { type: String, trim: true }
        },
        fraudFlags: [{ type: String, trim: true }],
        riskScore: { type: Number, default: 0 },
        payment: {
            provider: { type: String, default: 'stripe' },
            stripePaymentIntentId: { type: String, trim: true },
            stripeChargeId: { type: String, trim: true },
            stripeTransferId: { type: String, trim: true },
            applicationFeeAmount: { type: Number, default: 0 }
        },
        payoutHold: {
            active: { type: Boolean, default: false },
            reason: { type: String, trim: true },
            until: { type: Date }
        },
        dispute: {
            active: { type: Boolean, default: false },
            reason: { type: String, trim: true },
            openedAt: { type: Date },
            status: { type: String, enum: ['open', 'under_review', 'resolved'], default: 'open' },
            resolution: {
                outcome: { type: String, enum: ['refund', 'deny', 'partial_refund'] },
                note: { type: String, trim: true },
                resolvedAt: { type: Date }
            },
            evidence: [{
                url: { type: String, trim: true },
                note: { type: String, trim: true, maxLength: 1000 },
                uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
                uploadedAt: { type: Date, default: Date.now }
            }],
            stripeDisputeId: { type: String, trim: true }
        },
        shipping: {
            carrier: { type: String, trim: true },
            trackingNumber: { type: String, trim: true },
            labelUrl: { type: String, trim: true },
            status: { type: String, enum: ['label_created', 'in_transit', 'delivered'] },
            shippedAt: { type: Date },
            deliveredAt: { type: Date },
            lastUpdatedAt: { type: Date }
        },
        meetup: {
            time: { type: Date },
            campus: { type: String, trim: true },
            locationDetail: { type: String, trim: true },
            notes: { type: String, trim: true, maxLength: 1000 },
            safeZoneId: { type: String, trim: true },
            handoffCodeHash: { type: String, trim: true },
            handoffVerifiedAt: { type: Date }
        },
        contactExchange: {
            buyerShared: { type: Boolean, default: false },
            sellerShared: { type: Boolean, default: false },
            buyerPhone: { type: String, trim: true },
            sellerPhone: { type: String, trim: true },
            buyerEmail: { type: String, trim: true },
            sellerEmail: { type: String, trim: true },
            sharedAt: { type: Date }
        }
    }, { timestamps: true }
);

OrderSchema
.virtual('url')
.get(function () {
    return 'orders/' + this._id;
});

module.exports = mongoose.model('Order', OrderSchema);


