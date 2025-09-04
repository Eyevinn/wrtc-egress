import { write, parse } from "sdp-transform";

import { SfuProtocol } from "../../core/sfu/interface";
import { BaseViewer } from "../../core/baseViewer";
import { Viewer } from "../../core/interface";
import { MediaStreamsInfo } from "../../core/mediaStreamsInfo";

export class WhepViewer extends BaseViewer implements Viewer {
  constructor(channelId: string, resourceId: string, sfuProtocol: SfuProtocol, mediaStreams: MediaStreamsInfo) {
    super(channelId, resourceId, sfuProtocol, mediaStreams);
  }

  async generateOfferResponse(): Promise<string> {
    try {
      this.endpointDescription = 
        await this.getSfuProtocol().allocateEndpoint(this.getResourceId(), this.getId(), true, true, true);
      let offer = this.createOffer();
      this.emit("connect");
      return write(offer);
    } catch (exc) {
      this.error(exc);
      throw exc;
    }
  }

  async handleAnswerRequest(answer: string): Promise<void> {
    try {
      this.endpointDescription.audio.ssrcs = [];
      this.endpointDescription.video.streams = [];

      const parsedAnswer = parse(answer);
      const answerMediaDescription = parsedAnswer.media[0];
      let transport = this.endpointDescription["bundle-transport"];
      const answerFingerprint = parsedAnswer.fingerprint ? parsedAnswer.fingerprint : answerMediaDescription.fingerprint;
      transport.dtls.type = answerFingerprint.type;
      transport.dtls.hash = answerFingerprint.hash;
      transport.dtls.setup = answerMediaDescription.setup;
      transport.ice.ufrag = answerMediaDescription.iceUfrag;
      transport.ice.pwd = answerMediaDescription.icePwd;
      transport.ice.candidates = !answerMediaDescription.candidates ? [] : answerMediaDescription.candidates.flatMap(element => {
        return {
          'generation': element.generation ? element.generation : 0,
          'component': element.component,
          'protocol': element.transport.toLowerCase(),
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

  async handleIceCandidateRequest(candidate: string): Promise<void> {
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
