// Conversation Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ConversationSchema = new Schema(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        lastMessageAt: { type: Date },
        lastMessage: { type: String, trim: true }
    }, { timestamps: true }
);

ConversationSchema
.virtual('url')
.get(function () {
    return 'conversations/' + this._id;
});

module.exports = mongoose.model('Conversation', ConversationSchema);


