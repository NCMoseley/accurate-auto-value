"use server";

import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

const resend = new Resend(env.RESEND_API_KEY);

export const submitAutoInfo = async ({ userEmail, make, model, registrationDate, series, option }) => {
	const optionsAsHTMLString = (option) => {
		let html: string | null = null;
		Object.keys(option).forEach(key => {
			html += `<p>${key}: ${option[key]}</p>`;
		});
		if (!html) {
			html = '<p>None</p>';
		}
		return html;
	}
	try {
		console.log('submitAutoInfo:', userEmail, make, model, registrationDate, series, option);
		await resend.emails.send({
			from: siteConfig.name + '<info@resend.dev>',
			to: siteConfig.mailSupport,
			subject: 'New User Auto Info',
			html: `
				<h3>User Email: ${userEmail}</h3>
				<p>Make: ${make}</p>
				<p>Model: ${model}</p>
				<p>Registration Date: ${registrationDate}</p>
				<p>Series: ${series}</p>
				<div>Trim: ${optionsAsHTMLString(option)}</div>
			`,
		});
	} catch (error) {
		throw new Error("Failed to send verification email.");
	}

	return { ok: true };
};

