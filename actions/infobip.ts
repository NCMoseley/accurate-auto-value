'use server';

interface ApplicationConfiguration {
	pinAttempts: number;
	allowMultiplePinVerifications: boolean;
	pinTimeToLive: string;
	verifyPinLimit: string;
	sendPinPerApplicationLimit: string;
	sendPinPerPhoneNumberLimit: string;
}

export interface Application {
	applicationId: string;
	name: string;
	configuration: ApplicationConfiguration;
	enabled: boolean;
}

const headers = new Headers();
headers.append("Authorization", `App ${process.env.INFOBIP_API_KEY}`);
headers.append("Content-Type", "application/json");
headers.append("Accept", "application/json");

export async function createInfobipApp() {
	const raw = JSON.stringify({
		"name": "2fa test application",
		"enabled": true,
		"configuration": {
			"pinAttempts": 10,
			"allowMultiplePinVerifications": true,
			"pinTimeToLive": "15m",
			"verifyPinLimit": "1/3s",
			"sendPinPerApplicationLimit": "100/1d",
			"sendPinPerPhoneNumberLimit": "10/1d"
		}
	});

	const requestOptions = {
		method: "POST",
		headers: headers,
		body: raw,
		redirect: "follow" as RequestRedirect
	};

	let result: Application;
	try {
		const response = await fetch("https://api.infobip.com/2fa/2/applications", requestOptions);
		const responseData = await response.text();
		console.log("Application created", responseData);
		result = JSON.parse(responseData);
	} catch (error) {
		console.error("Error creating application", error);
		return {} as Application;
	}

	return result;
}

export async function setupTemplate() {
	const app = await createInfobipApp();

	if (!app.applicationId) {
		console.error('No app found');
		return;
	}

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
		const responseData = await response.text();
		console.log("Template created", responseData);
		result = JSON.parse(responseData);
	} catch (error) {
		console.error("Error creating template", error);
		return {} as Application;
	}

	return result;
}

export async function sendPasscode(to: string) {
	const template = await setupTemplate();

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
		const responseData = await response.text();
		console.log("Passcode sent", responseData);
		result = JSON.parse(responseData);
	} catch (error) {
		console.error("Error sending passcode", error);
		return {};
	}

	return result;
}

export async function verifyPasscode(pinId: string, pin: string) {
	const raw = JSON.stringify({
		"pin": pin
	});

	const requestOptions = {
		method: "POST",
		headers: headers,
		body: raw,
		redirect: "follow" as RequestRedirect
	};

	let result;
	try {
		const response = await fetch(`https://api.infobip.com/2fa/2/pin/${pinId}/verify`, requestOptions);
		const responseData = await response.text();
		console.log("Passcode verified", responseData);
		result = JSON.parse(responseData);
	} catch (error) {
		console.error("Error verifying passcode", error);
		return {};
	}

	return result;
}