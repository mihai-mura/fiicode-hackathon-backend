import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRouter from './src/express/routes/users.js';
import { instrument } from '@socket.io/admin-ui';
import { checkIfUuidRegistered, createChild, getParentFromChildUuid, updateChildLocation } from './src/database/mongoStuff.js';
import childrenRouter from './src/express/routes/children.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: '*',
	},
});

httpServer.listen(process.env.EXPRESS_PORT, () => {
	console.log(`Server listening on port ${process.env.EXPRESS_PORT}`);
});

instrument(io, {
	auth: false,
});

mongoose.connect(process.env.MONGO_URI, (error) => {
	if (error) console.log(error.message);
	else console.log('connected to db');
});

app.use(cors({ origin: '*' }));
app.use(express.json());

//routes
app.use('/users', userRouter);
app.use('/children', childrenRouter);

io.on('connection', (socket) => {
	socket.on('parent-id', (id) => {
		socket.join(id);
	});

	socket.on('uuid', async (uuid) => {
		socket.join(uuid);
		const dbResponse = await checkIfUuidRegistered(uuid);
		socket.emit('uuidRegistered', dbResponse);
	});

	socket.on('add-child', async (data) => {
		try {
			const child = await createChild(data.childUuid, data.name, data.parent);
			if (child) {
				socket.to(data.childUuid).emit('uuidRegistered', true);
			}
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('location', async (data) => {
		const [parentId, childId, childName] = await getParentFromChildUuid(data.uuid);
		await updateChildLocation(childId, data.latitude, data.longitude);
		socket.to(parentId).emit('location', {
			lat: data.latitude,
			lng: data.longitude,
			child: childId,
			name: childName,
		});
	});
});
