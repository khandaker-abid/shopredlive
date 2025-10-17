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
        status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open' }
    }, { timestamps: true }
);

ReportSchema
.virtual('url')
.get(function () {
    return 'reports/' + this._id;
});

module.exports = mongoose.model('Report', ReportSchema);


