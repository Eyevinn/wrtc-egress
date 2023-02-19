import { SfuType } from "./interface";
import { SmbProtocol, SmbProtocolOptions } from "./smb";

export default function (type: SfuType, sfuOptions) {
  switch (type) {
    case SfuType.smb:
      return new SmbProtocol(<SmbProtocolOptions>sfuOptions);
    default:
      throw new Error("Unsupported SFU type " + type);
  }
}