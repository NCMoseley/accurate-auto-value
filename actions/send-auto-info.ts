"use server";

import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

// import { getUserByEmail } from "./user";

const resend = new Resend(env.RESEND_API_KEY);

export const submitAutoInfo = async ({ userEmail, make, model, year, series, option }) => {
	console.log('resend:', resend);

	const trimAsHTMLString = (trim) => {
		let html: string | null = null;
		Object.keys(trim).forEach(key => {
			html += `<p>${key}: ${trim[key]}</p>`;
		});
		if (!html) {
			html = '<p>None</p>';
		}
		return html;
	}
	try {
		console.log('submitAutoInfo:', userEmail, make, model, year, series, option);
		await resend.emails.send({
			from: siteConfig.name + '<info@resend.dev>',
			to: siteConfig.mailSupport,
			subject: 'New User Auto Info',
			html: `
				<h3>User Email: ${userEmail}</h3>
				<p>Make: ${make}</p>
				<p>Model: ${model}</p>
				<p>Year: ${year}</p>
				<p>Series: ${series}</p>
				<div>Trim: ${trimAsHTMLString(option)}</div>
			`,
		});
		// const { data, error } = await resend.emails.send({
		//   from: provider.from,
		//   to:
		//     process.env.NODE_ENV === "development"
		//       ? "delivered@resend.dev"
		//       : identifier,
		//   subject: authSubject,
		//   react: MagicLinkEmail({
		//     firstName: 'New User',
		//     actionUrl: url,
		//     mailType: "register",
		//     siteName: siteConfig.name,
		//   }),
		//   // Set this to prevent Gmail from threading emails.
		//   // More info: https://resend.com/changelog/custom-email-headers
		//   headers: {
		//     "X-Entity-Ref-ID": new Date().getTime() + "",
		//   },
		// });

		// if (error || !data) {
		//   throw new Error(error?.message);
		// }

		// console.log(data)
	} catch (error) {
		throw new Error("Failed to send verification email.");
	}

	return { ok: true };
};

