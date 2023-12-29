import { Web5, Record } from "@web5/api";
import { Subject, SubjectObject } from "../composables/SubjectCreation";

export const submitSubjectAndSendToDwn = async (
  subject: Subject,
  web5: Web5
) => {
  const { record, status } = await web5.dwn.records.create({
    data: subject,
    message: {
      protocol: "https://myprotocol/post",
      protocolPath: "subject",
      schema: "https://myprotocol/schema/subject",
      dataFormat: "application/json",
      recipient: subject.authorDid,
    },
  });

  if (record) {
    // send the post to the subscriber first
    const { status: subjectStatus } = await record.send(subject.authorDid);
    console.log("Sent the subject to author DWN status:", subjectStatus);
  }
  return { record, status };
};

export const fetchSubjectsfromDwn = async (web5: Web5, did: string) => {
  console.log("Fetching subjects for:", did);
  const { records, status } = await web5.dwn.records.query({
    // from: the did of the remote dwn the query will fetch results from
    // if from is not set, the query will fetch results from the local dwn
    from: did,
    message: {
      filter: {
        protocol: "https://myprotocol/post",
        schema: "https://myprotocol/schema/subject",
      },
      dateSort: "createdAscending",
    },
  });

  return { records, status };
};

export const addSubscriberToSubject = async (
  web5: Web5,
  subject: Record,
  subscriberDid: string
) => {
  // send subject to subscriber
  const { status: subscriberStatus } = await subject.send(subscriberDid);
  console.log("Sent the subject to subscriber DWN status:", subscriberStatus);
  const subscribingMetadata = {
    subscriber: subscriberDid,
    date: new Date(),
  };
  const { record, status } = await web5.dwn.records.create({
    data: subscribingMetadata,
    message: {
      contextId: subject.id,
      parentId: subject.id,
      protocol: "https://myprotocol/post",
      protocolPath: "subject/mySubscriber",
      schema: "https://myprotocol/schema/mySubscriber",
      dataFormat: "application/json",
      recipient: subscriberDid,
    },
  });
  if (record) {
    const { status: subscriberStatus } = await record.send(subscriberDid);
    console.log("Sent the role to subscriber status:", subscriberStatus);
    const { status: myStatus } = await record.send(subject.author);
    console.log("Sent the role to author status:", myStatus);
  }
  return { record, status };
};
