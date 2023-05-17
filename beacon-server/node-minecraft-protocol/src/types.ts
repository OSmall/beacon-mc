export interface HostData {
	awsInstanceId: string,
	lastBoot: number, // milliseconds
	bootDuration: number, // milliseconds
}

export interface HostObject {
	[key: string]: HostData,
}