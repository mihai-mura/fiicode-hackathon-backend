import UserModel from './models/UserModel.js';
import bcrypt from 'bcrypt';
import ChildModel from './models/ChildModel.js';

export const createUser = async (email, password, firstName, lastName, role) => {
	try {
		//first letter capitalized
		const upperFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
		const upperLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
		const createdUser = await UserModel.create({
			email: email,
			password: password,
			first_name: upperFirstName,
			last_name: upperLastName,
			role: role,
		});
		return createdUser;
	} catch (error) {
		console.log(error);
		return error.code;
	}
};

export const getUserById = async (_id) => {
	const user = await UserModel.findById(_id);
	return user;
};

export const getUserByEmail = async (email) => {
	const user = await UserModel.findOne({ email: email });
	return user;
};

export const getUserRole = async (_id) => {
	const role = await UserModel.findById(_id).select({ role: 1, _id: 0 });
	return role.role;
};

export const updateUser = async (_id, field, data) => {
	switch (field) {
		case 'first-name':
			await UserModel.findByIdAndUpdate(_id, { first_name: data.charAt(0).toUpperCase() + data.slice(1) });
			return 1;
		case 'last-name':
			await UserModel.findByIdAndUpdate(_id, { last_name: data.charAt(0).toUpperCase() + data.slice(1) });
			return 1;
		case 'password':
			if (data.length < 8) {
				return 2; //password too short
			} else {
				const hashedPass = await bcrypt.hash(data, 10);
				await UserModel.findByIdAndUpdate(_id, { password: hashedPass });
				return 1;
			}
		default:
			return 0;
	}
};

export const deleteUser = async (_id) => {
	const user = await UserModel.findByIdAndDelete(_id);
	if (user) return 1;
	else return 0;
};

export const checkIfUuidRegistered = async (uuid) => {
	const user = await ChildModel.findOne({ device_uuid: uuid });
	if (user) return true;
	else return false;
};

export const createChild = async (uuid, name, parentId) => {
	const child = await ChildModel.create({
		device_uuid: uuid,
		name: name,
		parent: parentId,
	});
	await UserModel.findByIdAndUpdate(parentId, { $push: { children: uuid } });
	return child;
};
