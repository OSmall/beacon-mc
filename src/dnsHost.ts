import { ChangeResourceRecordSetsCommand, ListResourceRecordSetsCommand, Route53Client } from "@aws-sdk/client-route-53";
import { route53Config } from "./sensitive.js";

const DNS_TTL = 60;

export interface DNSHost {
    update(ip: string): Promise<Object>;
}

class Route53Singleton {
    private static _instance: Route53Client;
    private constructor() { }
    public static get instance() {
        if (this._instance === undefined)
            this._instance = new Route53Client(route53Config)
        return this._instance;
    }
}

export class AWSRoute53 implements DNSHost {
    readonly fqdn: string;
    readonly zoneId: string;

    constructor(fqdn: string, zoneId: string) {
        this.fqdn = fqdn;
        this.zoneId = zoneId;
    }

    async update(ip: string) {
        const changeRecordCommand = new ChangeResourceRecordSetsCommand({
            HostedZoneId: this.zoneId,
            ChangeBatch: {
                Changes: [
                    {
                        Action: 'UPSERT',
                        ResourceRecordSet: {
                            Name: this.fqdn,
                            Type: 'A',
                            TTL: DNS_TTL,
                            ResourceRecords: [
                                {
                                    Value: ip,
                                }
                            ]
                        }
                    }
                ]
            }
        });

        const value = Route53Singleton.instance.send(changeRecordCommand);
        console.log(`updating ${this.fqdn} A record to: ${ip}`);
        return value;
    }
}