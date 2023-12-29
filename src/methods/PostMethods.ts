import { Web5 } from "@web5/api";
import type { Post } from "../composables/PostCreation";

export const submitPublicPostAndSendToDwn = async (
  post: Post,
  web5: Web5,
  subjectId: string
) => {
  const { record, status } = await web5.dwn.records.create({
    data: post,
    message: {
      contextId: subjectId,
      parentId: subjectId,
      protocol: "https://myprotocol/post",
      protocolPath: "subject/post",
      schema: "https://myprotocol/schema/post",
      recipient: post.authorDid,
      published: true,
    },
  });

  if (record) {
    const { status: authorStatus } = await record.send(post.authorDid);
    console.log("Sent the post to author dwn status:", authorStatus);
  }
  return { record, status };
};

export const submitPremiumPostAndSendToDwn = async (
  post: Post,
  web5: Web5,
  subjectId: string
) => {
  const { record, status } = await web5.dwn.records.create({
    data: post,
    message: {
      contextId: subjectId,
      parentId: subjectId,
      protocol: "https://myprotocol/post",
      protocolPath: "subject/premiumPost",
      schema: "https://myprotocol/schema/premiumPost",
      recipient: post.authorDid,
      published: true,
    },
  });

  if (record) {
    const { status: authorStatus } = await record.send(post.authorDid);
    console.log("Sent the premium post to author dwn status:", authorStatus);
  }
  return { record, status };
};

export const fetchPostsfromDwn = async (web5: Web5, did: string) => {
  console.log("Fetching posts from:", did);
  const { records, status } = await web5.dwn.records.query({
    // from: the did of the remote dwn the query will fetch results from
    // if from is not set, the query will fetch results from the local dwn
    from: did,
    message: {
      filter: {
        protocol: "https://myprotocol/post",
        schema: "https://myprotocol/schema/post",
      },
      dateSort: "createdAscending",
    },
  });

  return { records, status };
};

export const fetchPremiumPostsfromDwn = async (web5: Web5, did: string) => {
  console.log("Fetching premium posts from:", did);
  const { records, status } = await web5.dwn.records.query({
    from: did,
    message: {
      filter: {
        protocol: "https://myprotocol/post",
        schema: "https://myprotocol/schema/premiumPost",
      },
      dateSort: "createdAscending",
    },
  });

  return { records, status };
};
