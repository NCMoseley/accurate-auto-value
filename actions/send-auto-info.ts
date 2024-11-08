"use server";

import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

const resend = new Resend(env.RESEND_API_KEY);

export const submitAutoInfo = async ({ userName, userEmail, userPhone = "", make, model, registrationDate, series, chosenOptions, mileage, displacement, body, isSwiss, doors, additionalInfo }) => {
	const optionsAsHTMLString = (option) => {
		let html: string = '';
		Object.keys(option).forEach(key => {
			html += `<div>${key}: ${option[key]}</div>`;
		});
		if (!html) {
			html = '<p>None</p>';
		}
		return html;
	}

	console.log('submitAutoInfo:', userName, userEmail, userPhone, make, model, registrationDate, series, mileage, displacement, body, isSwiss, doors, optionsAsHTMLString(chosenOptions), additionalInfo);

	try {
		await resend.emails.send({
			from: siteConfig.name + '<info@resend.dev>',
			to: siteConfig.mailSupport,
			subject: 'New User Auto Info',
			html: `
				<h3 style="font-family: Arial, sans-serif; color: #333; font-size: 18px; margin: 0 0 10px;">User Name: ${userName}</h3>
				<h3 style="font-family: Arial, sans-serif; color: #333; font-size: 18px; margin: 0 0 10px;">User Email: ${userEmail}</h3>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Registration Date: ${registrationDate}</p>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Make: ${make}</p>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Model: ${model}</p>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Series: ${series}</p>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Mileage: ${mileage}</p>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Displacement: ${displacement}</p>
				<div style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Options: ${optionsAsHTMLString(chosenOptions)}</div>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Body: ${body}</p>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Is Swiss: ${isSwiss}</p>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">Doors: ${doors}</p>
				<p style="font-family: Arial, sans-serif; color: #555; font-size: 14px; margin: 0 0 5px;">additionalInfo: ${additionalInfo}</p>
			`,
		});
	} catch (error) {
		throw new Error("Failed to send verification email.");
	}

	return { ok: true };
};

