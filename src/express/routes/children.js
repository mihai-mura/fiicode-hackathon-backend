import express from 'express';
import {
	deleteChild,
	getChildByUuid,
	getChildrenByParentId,
	getMembersChildren,
	updateChild,
} from '../../database/mongoStuff.js';
import { verifyToken } from '../middleware.js';

const router = express.Router();

router.get('/all', verifyToken, async (req, res) => {
	try {
		const children = await getChildrenByParentId(req._id);
		res.send(children);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.get('/member/all', verifyToken, async (req, res) => {
	try {
		const children = await getMembersChildren(req._id);
		res.send(children);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.get('/:uuid', async (req, res) => {
	try {
		const user = await getChildByUuid(req.params.uuid);
		if (user) {
			res.send(user.name);
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.delete('/:id', verifyToken, async (req, res) => {
	try {
		const dbResponse = await deleteChild(req.params.id, req._id);
		if (dbResponse) {
			res.sendStatus(200);
		} else {
			res.sendStatus(403);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.put('/:id', verifyToken, async (req, res) => {
	try {
		await updateChild(req.params.id, req.body.name);
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

export default router;
