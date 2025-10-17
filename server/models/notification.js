// Notification Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NotificationSchema = new Schema(
    {
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['message', 'offer', 'order', 'system'], required: true },
        title: { type: String, required: true, trim: true },
        body: { type: String, trim: true },
        data: { type: Object },
        readAt: { type: Date }
    }, { timestamps: true }
);

NotificationSchema
.virtual('url')
.get(function () {
    return 'notifications/' + this._id;
});

module.exports = mongoose.model('Notification', NotificationSchema);


