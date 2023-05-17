export interface HostData {
	awsInstanceId: string,
	lastBoot: number,
}

export interface HostObject {
	[key: string]: HostData,
}