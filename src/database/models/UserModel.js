import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		email: { type: String, unique: true },
		password: { type: String, required: true },
		first_name: { type: String, required: true },
		last_name: { type: String, required: true },
		children: { type: [String], default: [] },
		role: { type: String, required: true }, //*  user
	},
	{
		versionKey: false,
		collection: 'users',
		timestamps: false,
	}
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
