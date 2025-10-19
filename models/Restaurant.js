const mongoose = require("mongoose");

// Lightweight slugify helper (no external dependency required)
function slugifyString(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with '-'
    .replace(/^-+|-+$/g, "") // trim leading/trailing '-'
    .replace(/-{2,}/g, "-"); // collapse multiple '-'
}

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  logo: { type: String },
  address: { type: String, required: true },
  contact: { type: String },
  membership_level: { type: Number, default: 1 }, 
  subadmin_id: { type: String }, 
  homeImage: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Generate a unique slug from the name before save
RestaurantSchema.pre('save', async function(next) {
  try {
    // If name wasn't modified and slug already exists, skip
    if (!this.isModified('name') && this.slug) return next();

    const base = slugifyString(this.name || this._id?.toString?.().slice(-6) || 'restaurant');
    let slug = base || this._id?.toString?.().slice(-6) || 'restaurant';

    // Ensure uniqueness: if collision found, append numeric suffix
    let exists = await this.constructor.findOne({ slug });
    let suffix = 1;
    while (exists && exists._id && this._id && exists._id.toString() !== this._id.toString()) {
      slug = `${base}-${suffix++}`;
      exists = await this.constructor.findOne({ slug });
    }

    this.slug = slug;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
