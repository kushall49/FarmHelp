import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
