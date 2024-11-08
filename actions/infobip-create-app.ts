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

export async function createInfobipApp(): Promise<Application> {
	const headers = new Headers();
	headers.append("Authorization", `App ${process.env.INFOBIP_API_KEY}`);
	headers.append("Content-Type", "application/json");
	headers.append("Accept", "application/json");

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
		const responseData = await response.text(); // Await the response text
		console.log("Application created", responseData);
		result = JSON.parse(responseData); // Parse the response if it's JSON
	} catch (error) {
		console.error("Error creating application", error);
		return {} as Application; // Return null or handle the error as needed
	}

	return result;
}
