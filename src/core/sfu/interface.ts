export enum SfuType {
  smb = "SMB"
}

export interface SfuProtocol {
  log(...args: any[]);
  allocateEndpoint(conferenceId: string, 
    endpointId: string, audio: boolean, video: boolean, data: boolean): Promise<any>;
  configureEndpoint(conferenceId: string, endpointId: string, 
    endpointDescription: any): Promise<void>;

}