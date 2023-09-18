import { ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";
import { route53Client } from "./index.js";

export const x = route53Client.send(new ChangeResourceRecordSetsCommand({
	HostedZoneId: '<ZONE_ID>',
	ChangeBatch: {
		Changes: [
			{
				Action: 'UPSERT',
				ResourceRecordSet: {
					Name: '<FQDN>',
					Type: 'A',
					TTL: 60,
					ResourceRecords: [
						{
							Value: '1.1.1.1'
						}
					]
				}
			}
		]
	}
})).then(value => console.log(value));