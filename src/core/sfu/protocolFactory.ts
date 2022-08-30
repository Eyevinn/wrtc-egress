import { SfuType } from "./interface";
import { SmbProtocol } from "./smb";

export default function (type: SfuType, sfuOptions) {
  switch (type) {
    case SfuType.smb:
      return new SmbProtocol(sfuOptions);
      break;
    default:
      throw new Error("Unsupported SFU type " + type);
  }
}