import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		first_name: { type: String, required: true },
		last_name: { type: String, required: true },
		role: { type: String, required: true }, //*  user | moderator | local-admin
	},
	{
		versionKey: false,
		collection: 'users',
		timestamps: false,
	}
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
