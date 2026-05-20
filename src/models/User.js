import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    actualName: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    university: { type: String, trim: true, default: 'Stony Brook University' },
    campus: { type: String, trim: true },
    phone: { type: String, trim: true },
    karma: { type: Number, default: 100 },
    isAdmin: { type: Boolean, default: false },
    isVerifiedStudent: { type: Boolean, default: false },
    moderation: {
      status: { type: String, enum: ['active', 'warned', 'suspended', 'banned'], default: 'active' },
      warnings: { type: Number, default: 0 },
      suspendedUntil: { type: Date },
      reason: { type: String, trim: true },
      lastActionAt: { type: Date }
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLoginIp: { type: String, trim: true },
    lastLoginGeo: {
      country: { type: String, trim: true },
      region: { type: String, trim: true },
      city: { type: String, trim: true },
      source: { type: String, trim: true }
    },
    lastLoginAt: { type: Date },
    knownDevices: [{
      fingerprint: { type: String, required: true },
      label: { type: String, trim: true },
      userAgent: { type: String, trim: true },
      ip: { type: String, trim: true },
      geo: {
        country: { type: String, trim: true },
        region: { type: String, trim: true },
        city: { type: String, trim: true },
        source: { type: String, trim: true }
      },
      firstSeenAt: { type: Date, default: Date.now },
      lastSeenAt: { type: Date, default: Date.now },
      trusted: { type: Boolean, default: true }
    }],
    passwordResetTokenHash: { type: String },
    passwordResetExpiresAt: { type: Date },
    mfa: {
      activeChallengeId: { type: String },
      codeHash: { type: String },
      delivery: { type: String, enum: ['email', 'system'], default: 'email' },
      reason: { type: String, trim: true },
      expiresAt: { type: Date },
      verifiedAt: { type: Date },
      lastSentAt: { type: Date }
    },
    stripe: {
      accountId: { type: String, trim: true },
      payoutsHeldUntil: { type: Date },
      payoutsHeldReason: { type: String, trim: true }
    },
    responseTimeAvgMinutes: { type: Number, default: null },
    responseTimeCount: { type: Number, default: 0 },
    savedSearches: [{
      id: { type: String, required: true },
      name: { type: String, trim: true },
      query: { type: String, trim: true },
      filters: {
        category: { type: Schema.Types.ObjectId, ref: 'Category' },
        condition: { type: String, trim: true },
        minPrice: { type: Number },
        maxPrice: { type: Number },
        campus: { type: String, trim: true },
        allowsMeetup: { type: Boolean },
        allowsShipping: { type: Boolean },
        negotiable: { type: Boolean }
      },
      createdAt: { type: Date, default: Date.now },
      lastCheckedAt: { type: Date }
    }],
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    savedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    profilePic: { type: String }
  },
  { timestamps: true }
);

UserSchema.methods.validatePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

export default mongoose.models.User || mongoose.model('User', UserSchema);