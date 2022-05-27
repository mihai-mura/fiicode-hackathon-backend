import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRouter from './src/express/routes/users.js';
import { instrument } from '@socket.io/admin-ui';
import { checkIfUuidRegistered, createChild } from './src/database/mongoStuff.js';

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

io.on('connection', (socket) => {
	socket.on('uuid', async (uuid) => {
		socket.join(uuid);
		const dbResponse = await checkIfUuidRegistered(uuid);
		socket.emit('uuidRegistered', dbResponse);
	});

	socket.on('add-child', async (data) => {
		try {
			console.log(data);
			const child = await createChild(data.childUuid, data.name, data.parent);
			if (child) {
				socket.to(data.childUuid).emit('uuidRegistered', true);
			}
		} catch (error) {
			console.log(error);
		}
	});
});
