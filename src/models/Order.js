import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'pending_meetup', 'under_review', 'completed', 'cancelled', 'disputed', 'refunded'],
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
      stripeDisputeId: { type: String, trim: true }
    },
    meetup: {
      time: { type: Date },
      campus: { type: String, trim: true },
      locationDetail: { type: String, trim: true },
      notes: { type: String, trim: true, maxLength: 1000 }
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
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);