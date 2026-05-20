// Report Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ReportSchema = new Schema(
    {
        reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
        targetProduct: { type: Schema.Types.ObjectId, ref: 'Product' },
        reason: { type: String, required: true, trim: true },
        details: { type: String, trim: true, maxLength: 5000 },
        status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open' },
        moderatorNotes: [{
            note: { type: String, trim: true, maxLength: 2000 },
            createdAt: { type: Date, default: Date.now },
            createdBy: { type: String, trim: true }
        }],
        actions: [{
            action: { type: String, trim: true },
            note: { type: String, trim: true, maxLength: 2000 },
            createdAt: { type: Date, default: Date.now },
            createdBy: { type: String, trim: true },
            metadata: { type: Object }
        }]
    }, { timestamps: true }
);

ReportSchema
.virtual('url')
.get(function () {
    return 'reports/' + this._id;
});

module.exports = mongoose.model('Report', ReportSchema);


