'use server';

import { Application } from './infobip-create-app';
import { setupTemplate } from './infobip-setup-template';

export async function sendPasscode(to: string) {
	const template = await setupTemplate();
	const headers = new Headers();
	headers.append("Authorization", `App ${process.env.INFOBIP_API_KEY}`);
	headers.append("Content-Type", "application/json");
	headers.append("Accept", "application/json");

	const raw = JSON.stringify({
		"applicationId": template.applicationId,
		"messageId": template.messageId,
		"from": "41798070047",
		"to": to
	});

	const requestOptions = {
		method: "POST",
		headers: headers,
		body: raw,
		redirect: "follow" as RequestRedirect
	};

	let result;
	try {
		const response = await fetch(`https://api.infobip.com/2fa/2/pin`, requestOptions);
		const responseData = await response.text(); // Await the response text
		console.log("Passcode sent", responseData);
		result = JSON.parse(responseData); // Parse the response if it's JSON
	} catch (error) {
		console.error("Error sending passcode", error);
		return {} as Application; // Return null or handle the error as needed
	}

	// return result;
}