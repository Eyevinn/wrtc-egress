import { write, parse } from "sdp-transform";

import { SfuProtocol } from "../../core/sfu/interface";
import { BaseViewer } from "../../core/baseViewer";
import { WhppOfferResponse, WhppAnswerRequest, WhppCandidateRequest } from "./requests";
import { Viewer } from "../../core/interface";
import { MediaStreamsInfo } from "../../core/mediaStreamsInfo";

export class WhppViewer extends BaseViewer implements Viewer {
  constructor(channelId: string, resourceId: string, sfuProtocol: SfuProtocol, mediaStreams: MediaStreamsInfo) {
    super(channelId, resourceId, sfuProtocol, mediaStreams);
  }

  async generateOfferResponse(): Promise<WhppOfferResponse> {
    try {
      this.endpointDescription = 
        await this.getSfuProtocol().allocateEndpoint(this.getResourceId(), this.getId(), true, true, true);
      let offer = this.createOffer();

      this.emit("connect");
      const offerResponse: WhppOfferResponse = {
        offer: write(offer),
        mediaStreams: this.mediaStreams.video.ssrcs.flatMap(element => {
          return { streamId: element.mslabel };
        })
      };
      return offerResponse;
    } catch (exc) {
      this.error(exc);
      throw exc;
    }
  }

  async handleAnswerRequest(request: WhppAnswerRequest): Promise<void> {
    try {
      this.endpointDescription.audio.ssrcs = [];
      this.endpointDescription.video.ssrcs = [];
      this.endpointDescription.video["ssrc-groups"] = [];

      const parsedAnswer = parse(request.answer);
      const answerMediaDescription = parsedAnswer.media[0];
      let transport = this.endpointDescription["bundle-transport"];
      transport.dtls.type = answerMediaDescription.fingerprint.type;
      transport.dtls.hash = answerMediaDescription.fingerprint.hash;
      transport.dtls.setup = answerMediaDescription.setup;
      transport.ice.ufrag = answerMediaDescription.iceUfrag;
      transport.ice.pwd = answerMediaDescription.icePwd;
      transport.ice.candidates = !answerMediaDescription.candidates ? [] : answerMediaDescription.candidates.flatMap(element => {
        return {
          'generation': element.generation,
          'component': element.component,
          'protocol': element.transport,
          'port': element.port,
          'ip': element.ip,
          'relPort': element.rport,
          'relAddr': element.raddr,
          'foundation': element.foundation.toString(),
          'priority': parseInt(element.priority.toString(), 10),
          'type': element.type,
          'network': element["network-id"]
        };
      });

      return await this.getSfuProtocol().configureEndpoint(this.getResourceId(), this.getId(), this.endpointDescription);
    } catch (exc) {
      this.error(exc);
      throw exc;
    }

  }

  async handleIceCandidateRequest(request: WhppCandidateRequest): Promise<void> {
    try {
      throw new Error("PATCH not supported");
    } catch (exc) {
      this.error(exc);
      throw exc;
    }
  }
  
  destroy() {
  }

  supportIceTrickle(): boolean {
    return false;
  }

}