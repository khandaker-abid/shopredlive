import mongoose from 'mongoose';

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['message', 'offer', 'order', 'system'], required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    data: { type: Object },
    readAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);