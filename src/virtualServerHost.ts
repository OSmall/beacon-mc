import { DescribeInstanceStatusCommand, DescribeInstancesCommand, EC2Client, InstanceStateName, StartInstancesCommand, StopInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Config } from "./sensitive.js";

export interface VirtualServerHost {
	start(): Promise<Object>;
	stop(): Promise<Object>;
	getState(): Promise<InstanceStateName>;
	getIP(): Promise<string>;
}

class EC2Singleton {
	private static _instance: EC2Client;
	private constructor() { }
	public static get instance() {
		if (this._instance === undefined)
			this._instance = new EC2Client(ec2Config);
		return this._instance;
	}
}

export class AwsEc2 implements VirtualServerHost {
	readonly instanceId: string;

	constructor(instanceId: string) {
		this.instanceId = instanceId;
	}

	async start() {
		const startCommand = new StartInstancesCommand({ InstanceIds: [this.instanceId] });

		const value = await EC2Singleton.instance.send(startCommand);
		console.log(`Booting ${this.instanceId} EC2 instance`);
		return value;
	}

	async stop() {
		const stopCommand = new StopInstancesCommand({ InstanceIds: [this.instanceId] });

		const value = await EC2Singleton.instance.send(stopCommand);
		console.log(`Stopping ${this.instanceId} EC2 instance`);
		return value;
	}

	async getState() {
		const describeStatusCommand = new DescribeInstanceStatusCommand({
			InstanceIds: [this.instanceId],
			IncludeAllInstances: true,
		});

		const value = await EC2Singleton.instance.send(describeStatusCommand);
		const status = value.InstanceStatuses?.[0].InstanceState?.Name;
		if (status === undefined) throw new Error('undefined EC2 status');
		return status;
	}

	async getIP() {
		const describeCommand = new DescribeInstancesCommand({ InstanceIds: [this.instanceId] });

		const value = await EC2Singleton.instance.send(describeCommand);
		const ip = value?.Reservations?.[0].Instances?.[0]?.PublicIpAddress;
		if (ip === undefined) throw new Error('undefined EC2 IP');
		return ip;
	}
}