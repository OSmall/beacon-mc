import { DescribeInstanceStatusCommand, EC2Client, InstanceStateName, StartInstancesCommand, StopInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Config } from "./sensitive0.js";

export interface VirtualServer {
	start(): Promise<Object>,
	stop(): Promise<Object>,
	getState(): Promise<InstanceStateName>,
}

class EC2Singleton {
	private static _instance: EC2Client;
	private constructor() { }
	public static get instance() {
		if (this._instance === undefined)
			this._instance = new EC2Client(ec2Config)
		return this._instance;
	}
}

export class AwsEc2 implements VirtualServer {
	readonly instanceId: string;

	constructor(instanceId: string) {
		this.instanceId = instanceId;
	}

	start() {
		const startCommand = new StartInstancesCommand({ InstanceIds: [this.instanceId] });
		return EC2Singleton.instance.send(startCommand).then((value) => {
			console.log(`Booting ${this.instanceId} EC2 instance`);
			return value;
		}).catch((error) => {
			console.error(error);
			throw error;
		});
	}

	stop() {
		const stopCommand = new StopInstancesCommand({ InstanceIds: [this.instanceId] });
		return EC2Singleton.instance.send(stopCommand).then((value) => {
			console.log(`Stopping ${this.instanceId} EC2 instance`);
			return value;
		}).catch((error) => {
			console.error(error);
			throw error;
		});
	}

	getState() {
		const describeCommand = new DescribeInstanceStatusCommand({
			InstanceIds: [this.instanceId],
			IncludeAllInstances: true,
		});

		return EC2Singleton.instance.send(describeCommand).then((obj) => {
			const status = obj.InstanceStatuses?.[0].InstanceState?.Name;
			if (status === undefined) throw new Error('undefined EC2 status');
			return status;
		}).catch((error) => {
			console.error(error);
			throw error;
		});
	}
}