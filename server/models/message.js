// Message Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var MessageSchema = new Schema(
    {
        conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        body: { type: String, required: true, trim: true, maxLength: 5000 },
        attachments: [{ type: Buffer }],
        readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }, { timestamps: true }
);

MessageSchema
.virtual('url')
.get(function () {
    return 'messages/' + this._id;
});

module.exports = mongoose.model('Message', MessageSchema);


