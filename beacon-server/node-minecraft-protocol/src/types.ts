export interface HostData {
	awsInstanceId: string,
	lastBoot: number, // milliseconds
	lastEmpty: number,
	bootDuration: number, // milliseconds
}

export interface HostObject {
	[key: string]: HostData,
}