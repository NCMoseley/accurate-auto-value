"use server";

import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

const resend = new Resend(env.RESEND_API_KEY);

export const submitAutoInfo = async ({ userName, userEmail, userPhone = "", make, model, registrationDate, series, chosenOptions, mileage, displacement, body, doors }) => {
	const optionsAsHTMLString = (option) => {
		let html: string | null = null;
		Object.keys(option).forEach(key => {
			html += `<p>${key}: ${option[key]}</p>`;
		});
		if (!html) {
			html = '<p>None</p>';
		}
		console.log('html:', html);
		return html;
	}

	try {
		console.log('submitAutoInfo:', userName, userEmail, userPhone, make, model, registrationDate, series, optionsAsHTMLString(chosenOptions));
		// await resend.emails.send({
		// 	from: siteConfig.name + '<info@resend.dev>',
		// 	to: siteConfig.mailSupport,
		// 	subject: 'New User Auto Info',
		// 	html: `
		// 		<h3 style="font-family: Arial, sans-serif; color: #333; font-size: 18px; margin: 0 0 10px;">User Name: ${userName}</h3>
		// 		<h3 style="font-family: Arial, sans-serif; color: #333; font-size: 18px; margin: 0 0 10px;">User Email: ${userEmail}</h3>
		// 		<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">User Phone: ${userPhone}</p>
		// 		<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Registration Date: ${registrationDate}</p>
		// 		<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Make: ${make}</p>
		// 		<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Model: ${model}</p>
		// 		<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Series: ${series}</p>
		// 		<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Mileage: ${mileage}</p>
		// 		<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Displacement: ${displacement}</p>
		// 		<div style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Trim: ${optionsAsHTMLString(chosenOptions)}</div>
		// 		<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Body: ${body}</p>
		// 		<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Doors: ${doors}</p>
		// 	`,
		// });
	} catch (error) {
		throw new Error("Failed to send verification email.");
	}

	return { ok: true };
};

