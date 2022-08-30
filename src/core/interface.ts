import { SfuProtocol } from "./sfu/interface";

export interface Viewer {
  getId(): string;
  getResourceId(): string;
  getSfuProtocol(): SfuProtocol;

  generateOfferResponse(): Promise<any>; 
  handleAnswerRequest(request: any): Promise<any>;
  handleIceCandidateRequest(request: any): Promise<any>;

  destroy(): void;
  supportIceTrickle(): boolean;
}