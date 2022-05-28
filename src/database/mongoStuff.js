import UserModel from './models/UserModel.js';
import bcrypt from 'bcrypt';
import ChildModel from './models/ChildModel.js';
import ROLE from '../express/roles.js';

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
		name: name.charAt(0).toUpperCase() + name.slice(1),
		parent: parentId,
	});
	await UserModel.findByIdAndUpdate(parentId, { $push: { children: child?._id } });
	return child;
};

export const getChildByUuid = async (uuid) => {
	const child = await ChildModel.findOne({ device_uuid: uuid });
	return child;
};

export const getParentFromChildUuid = async (uuid) => {
	const child = await ChildModel.findOne({ device_uuid: uuid });
	const parent = await UserModel.findById(child?.parent);

	return [parent._id.toString(), child._id.toString(), child.name];
};

export const getChildrenByParentId = async (parentId) => {
	const children = await ChildModel.find({ parent: parentId });
	return children;
};

export const deleteChild = async (childId, parentId) => {
	const child = await ChildModel.findByIdAndDelete(childId);
	if (child.parent === parentId) {
		await ChildModel.findByIdAndDelete(childId);
		await UserModel.findByIdAndUpdate(parentId, { $pull: { children: childId } });
		return 1;
	} else return 0;
};

export const updateChildLocation = async (childId, latitude, longitude) => {
	await ChildModel.findByIdAndUpdate(childId, { location: { lat: latitude, lng: longitude } });
};

export const createMember = async (email, password, firstName, lastName, role, parent) => {
	try {
		//first letter capitalized
		const upperFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
		const upperLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
		const createdUser = await UserModel.create({
			email: email,
			password: password,
			first_name: upperFirstName,
			last_name: upperLastName,
			parent: parent,
			role: role,
		});
		return createdUser;
	} catch (error) {
		console.log(error);
		return error.code;
	}
};

export const getParentsMembers = async (parentId) => {
	const members = await UserModel.find({ parent: parentId, role: ROLE.MEMBER });
	return members;
};

export const deleteMember = async (memberId, parentId) => {
	const user = await UserModel.findById(memberId);
	if (user.parent === parentId) {
		await UserModel.findByIdAndDelete(memberId);
		return 1;
	} else return 0;
};

export const getMembersChildren = async (memberId) => {
	const member = await UserModel.findById(memberId);
	const children = await ChildModel.find({ parent: member.parent });
	return children;
};

export const getParentIdFromMemberId = async (memberId) => {
	const member = await UserModel.findById(memberId);
	return member.parent;
};

export const updateChild = async (childId, name) => {
	await ChildModel.findByIdAndUpdate(childId, { name: name.charAt(0).toUpperCase() + name.slice(1) });
};

export const getParentEmail = async (parentId) => {
	const parent = await UserModel.findById(parentId);
	return parent.email;
};
