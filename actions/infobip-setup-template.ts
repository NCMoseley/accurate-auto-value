'use server';
import { createInfobipApp, Application } from './infobip-create-app';

export async function setupTemplate() {
	const app = await createInfobipApp();

	if (!app.applicationId) {
		console.error('No app found');
		return;
	}

	const headers = new Headers();
	headers.append("Authorization", `App ${process.env.INFOBIP_API_KEY}`);
	headers.append("Content-Type", "application/json");
	headers.append("Accept", "application/json");

	const raw = JSON.stringify({
		"pinType": "NUMERIC",
		"messageText": "Your pin is {{pin}}",
		"pinLength": 4,
		"senderId": "ServiceSMS"
	});

	const requestOptions = {
		method: "POST",
		headers: headers,
		body: raw,
		redirect: "follow" as RequestRedirect
	};

	let result;
	try {
		const response = await fetch(`https://api.infobip.com/2fa/2/applications/${app.applicationId}/messages`, requestOptions);
		const responseData = await response.text(); // Await the response text
		console.log("Template created", responseData);
		result = JSON.parse(responseData); // Parse the response if it's JSON
	} catch (error) {
		console.error("Error creating template", error);
		return {} as Application; // Return null or handle the error as needed
	}

	return result;
}
