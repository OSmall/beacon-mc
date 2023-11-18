import { HostConfigObject } from "./types.js";
import { AwsEc2 } from "./virtualServerHost.js";
import { AWSRoute53DNS, CloudflareDNS } from "./dnsHost.js";
import { EC2ClientConfig } from "@aws-sdk/client-ec2";
import { Route53ClientConfig } from "@aws-sdk/client-route-53";
import { fromIni } from "@aws-sdk/credential-providers";
import { AuthObject } from "cloudflare";

export const hostConfig: HostConfigObject = {
	'<MC_HOST_NAME>': {
		virtualServer: new AwsEc2('<MC_AWS_EC2_ID>'),
		dns: new CloudflareDNS('<CLOUDFLARE_ZONE_ID>', '<CLOUDFLARE_RECORD_ID>', '<HOST_FQDN>'),
		bootDuration: 60,
		idleTime: 60 * 10,
	}, // add more hosts to monitor here
};

export const ec2Config: EC2ClientConfig = {
	region: '<AWS_REGION>',
	credentials: fromIni(),
};

export const route53Config: Route53ClientConfig = {
	region: '<AWS_REGION>',
	credentials: fromIni(),
};

export const cloudflareConfig: AuthObject = {
    email: '<AUTH_EMAIL>',
    token: '<AUTH_TOKEN>',
}