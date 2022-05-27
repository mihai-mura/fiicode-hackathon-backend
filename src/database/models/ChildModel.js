import mongoose from 'mongoose';

const childSchema = new mongoose.Schema(
	{
		device_uuid: { type: String, required: true },
		name: { type: String, required: true },
		parent: { type: String, required: true },
		location: { type: Object, default: { lat: 0, lng: 0 } },
		role: { type: String, default: 'child' }, //*  child
	},
	{
		versionKey: false,
		collection: 'children',
		timestamps: false,
	}
);

const ChildModel = mongoose.model('Child', childSchema);

export default ChildModel;
