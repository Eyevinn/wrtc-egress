export enum SfuType {
  smb = "SMB"
}

export interface SfuProtocol {
  allocateEndpoint(conferenceId: string, 
    endpointId: string, audio: boolean, video: boolean, data: boolean): Promise<any>;
  configureEndpoint(conferenceId: string, endpointId: string, 
    endpointDescription: any): Promise<void>;

}