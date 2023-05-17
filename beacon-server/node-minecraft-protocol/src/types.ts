export interface HostData {
	awsInstanceId: string,
	lastBoot: number, // milliseconds
	bootDuration: number, // milliseconds
	lastEmpty: number,
}

export interface HostObject {
	[key: string]: HostData,
}