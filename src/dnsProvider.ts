import { ChangeResourceRecordSetsCommand, Route53Client } from "@aws-sdk/client-route-53";
import { cloudflareConfig, route53Config } from "./sensitive.js";
import Cloudflare from "cloudflare";

const DNS_TTL = 60; // TODO: move this to config

export interface DNSProvider {
    update(ip: string): Promise<Object>;
}

class Route53Singleton {
    private static _instance: Route53Client;
    private constructor() { }
    public static get instance() {
        if (this._instance === undefined)
            this._instance = new Route53Client(route53Config);
        return this._instance;
    }
}

export class AWSRoute53DNS implements DNSProvider {
    readonly zoneId: string;
    readonly fqdn: string;

    constructor(zoneId: string, fqdn: string) {
        this.zoneId = zoneId;
        this.fqdn = fqdn;
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

class CloudflareSingleton {
    private static _instance: Cloudflare;
    private constructor() { }
    public static get instance() {
        if (this._instance === undefined)
            this._instance = new Cloudflare(cloudflareConfig);
        return this._instance;
    }
}

export class CloudflareDNS implements DNSProvider {
    readonly zoneId: string;
    readonly recordId: string;
    readonly fqdn: string;

    constructor(zoneId: string, recordId: string, fqdn: string) {
        this.zoneId = zoneId;
        this.recordId = recordId;
        this.fqdn = fqdn;
    }

    async update(ip: string) {
        const value = CloudflareSingleton.instance.dnsRecords.edit(this.zoneId, this.recordId, {
            type: 'A',
            name: this.fqdn,
            content: ip,
            ttl: DNS_TTL,
            proxied: false,
        });
        console.log(`updating ${this.fqdn} A record to: ${ip}`);
        return value;
    }
}
