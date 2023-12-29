import type { Web5, ProtocolsConfigureResponse } from "@web5/api";
import type { ProtocolDefinition } from "@tbd54566975/dwn-sdk-js";

export const configureProtocol = async (
  web5: Web5,
  did: string,
  protocolDefinition: ProtocolDefinition
) => {
  const { protocols: localProtocol, status: localProtocolStatus } =
    await queryForProtocol(web5, protocolDefinition.protocol);
  console.log({ localProtocol, localProtocolStatus });
  if (localProtocolStatus.code !== 200 || localProtocol.length === 0) {
    const { protocol, status } = await installProtocolLocally(
      web5,
      protocolDefinition
    );
    console.log("Protocol installed locally", protocol, status);

    if (protocol) {
      const { status: configureRemoteStatus } = await protocol.send(did);
      console.log(
        "Did the protocol install on the remote DWN?",
        configureRemoteStatus
      );
    }
  } else {
    console.log("Protocol already installed");
  }
};

const queryForProtocol = async (web5: Web5, protocol: string) => {
  return await web5.dwn.protocols.query({
    message: {
      filter: {
        protocol: protocol,
      },
    },
  });
};

export const installProtocolLocally = async (
  web5: Web5,
  protocolDefinition: ProtocolDefinition
): Promise<ProtocolsConfigureResponse> => {
  return await web5.dwn.protocols.configure({
    message: {
      definition: protocolDefinition,
    },
  });
};

export const forceInstallProtocol = async (
  web5: Web5,
  did: string,
  protocolDefinition: ProtocolDefinition
) => {
  const { protocol, status } = await installProtocolLocally(
    web5,
    protocolDefinition
  );
  console.log("Protocol installed locally", protocol, status);

  if (protocol) {
    const { status: configureRemoteStatus } = await protocol.send(did);
    console.log("Install protocol on the remote DWN:", configureRemoteStatus);
  }
};
