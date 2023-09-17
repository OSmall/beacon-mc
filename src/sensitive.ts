import { HostConfigObject } from "./types";
import { EC2ClientConfig } from "@aws-sdk/client-ec2";
import { Route53ClientConfig } from "@aws-sdk/client-route-53";
import { fromIni } from "@aws-sdk/credential-providers";

export const hostConfig: HostConfigObject = {
	'<MC_HOST_NAME>': {
		ec2InstanceId: '<MC_AWS_EC2_ID>',
		bootDuration: 60,
		idleTime: 60 * 10,
	}, // add more hosts to monitor here
};

export const ec2Config: EC2ClientConfig = {
	region: "<AWS_REGION>",
	credentials: fromIni(),
};

export const route53Config: Route53ClientConfig = {
	credentials: fromIni(),
};