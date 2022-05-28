import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import handlebars from 'nodemailer-express-handlebars';

dotenv.config();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		//! update mail
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

const handlebarsOptions = {
	viewEngine: {
		extName: '.handlebars',
		partialsDir: path.resolve('./src/mail/templates'),
		defaultLayout: false,
	},
	viewPath: path.resolve('./src/mail/templates'),
	extName: '.handlebars',
};

transporter.use('compile', handlebars(handlebarsOptions));

export const sendPassRecoverMail = async (to, token) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: to,
		subject: 'Password Recovery',
		template: 'passRecovery',
		context: {
			link: `http://${process.env.PUBLIC_SITE_LINK}/recover-password/${token}`,
			defaultHostname: process.env.PUBLIC_SITE_LINK,
			defaultLink: `http://${process.env.PUBLIC_SITE_LINK}`,
		},
		attachments: [
			{
				filename: 'logo-cityq.png',
				path: path.resolve('./src/mail/images/trackme-logo.png'),
				cid: 'logo',
			},
		],
	};
	await transporter
		.sendMail(mailOptions)
		.then(() => {
			console.log(`Pass recovery email sent to: ${to}`);
		})
		.catch((error) => {
			console.log(error);
		});
};

export const sendNotificationMail = async (to, message) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: to,
		subject: 'Child Alert',
		template: 'notification',
		context: {
			defaultHostname: process.env.PUBLIC_SITE_LINK,
			defaultLink: `http://${process.env.PUBLIC_SITE_LINK}`,
			message,
		},
		attachments: [
			{
				filename: 'logo-cityq.png',
				path: path.resolve('./src/mail/images/trackme-logo.png'),
				cid: 'logo',
			},
		],
	};
	await transporter
		.sendMail(mailOptions)
		.then(() => {
			console.log(`Notification email sent to: ${to}`);
		})
		.catch((error) => {
			console.log(error);
		});
};
