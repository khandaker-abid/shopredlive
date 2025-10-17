// Category Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, trim: true },
        parent: { type: Schema.Types.ObjectId, ref: 'Category' },
        icon: { type: String, trim: true }
    }, { timestamps: true }
);

CategorySchema
.virtual('url')
.get(function () {
    return 'categories/' + this._id;
});

module.exports = mongoose.model('Category', CategorySchema);


