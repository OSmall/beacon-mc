import { HostObject } from "./types";
import { EC2ClientConfig } from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const hosts: HostObject = {
	'<MC_HOST_NAME>': {
		awsInstanceId: '<MC_AWS_EC2_ID>',
		lastBoot: 0,
	}, // add more hosts to monitor here
}

export const ec2Config: EC2ClientConfig = {
  region: "<AWS_REGION>",
  credentials: fromIni(),
}