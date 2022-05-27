import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserById, getUserByEmail, updateUser } from '../../database/mongoStuff.js';
import { verifyToken } from '../middleware.js';
import ROLE from '../roles.js';
import { sendPassRecoverMail } from '../../mail/mail.js';

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
		const hashedPass = await bcrypt.hash(req.body.password, 10);
		const user = await createUser(req.body.email, hashedPass, req.body.firstName, req.body.lastName, ROLE.PARENT);
		if (user === 11000) {
			//* duplicate error
			res.status(409).send('email already in use');
		} else {
			const token = jwt.sign(
				{
					_id: user._id,
				},
				process.env.JWT_SECRET
			);
			res.status(201).send({
				token,
				user: {
					_id: user._id,
					email: user.email,
					firstName: user.first_name,
					lastName: user.last_name,
					role: user.role,
				},
			});
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.post('/login', async (req, res) => {
	try {
		const user = await getUserByEmail(req.body.email);
		if (user) {
			if (await bcrypt.compare(req.body.password, user.password)) {
				const token = jwt.sign(
					{
						_id: user._id,
					},
					process.env.JWT_SECRET
				);
				res.send({
					token,
					user: {
						_id: user._id,
						email: user.email,
						firstName: user.first_name,
						lastName: user.last_name,
						role: user.role,
					},
				});
			} else res.sendStatus(403);
		} else res.sendStatus(404);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.get('/', verifyToken, async (req, res) => {
	try {
		const user = await getUserById(req._id);
		res.send({
			_id: user._id,
			email: user.email,
			firstName: user.first_name,
			lastName: user.last_name,
			role: user.role,
		});
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.post('/restore-password-email', async (req, res) => {
	try {
		const user = await getUserByEmail(req.body.email);
		if (user) {
			const token = jwt.sign(
				{
					_id: user._id,
				},
				process.env.JWT_SECRET,
				{ expiresIn: '1d' }
			);
			await sendPassRecoverMail(user.email, token);
			res.sendStatus(200);
		} else res.sendStatus(404);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.put('/:field', verifyToken, async (req, res) => {
	//* field types: first-name | last-name | password
	try {
		const dbResponse = await updateUser(req._id, req.params.field, req.body.value);
		switch (dbResponse) {
			case 1:
				res.sendStatus(200);
				break;
			case 0:
				res.sendStatus(404);
				break;
			case 2: //* password too short
				res.sendStatus(400);
				break;
			default:
				res.sendStatus(500);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

//verifies if token expired
router.get('/restore-password-valid', verifyToken, async (req, res) => {
	res.sendStatus(200);
});

router.post('/restore-password', verifyToken, async (req, res) => {
	try {
		const dbResponse = await updateUser(req._id, 'password', req.body.password);
		switch (dbResponse) {
			case 1:
				res.sendStatus(200);
				break;
			case 0:
				res.sendStatus(404);
				break;
			case 2: //* password too short
				res.sendStatus(400);
				break;
			default:
				res.sendStatus(500);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

export default router;
