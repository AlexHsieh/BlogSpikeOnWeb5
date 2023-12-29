# A role spike App <!-- omit from toc -->

The main code that powers this app is [here](./src/App.vue)

[![Edit in CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/AlexHsieh/BlogSpikeOnWeb5)

## Run and Build:

Step 1: `npm install && npm run dev`

Step 2: Navigate to `http://localhost:5174` <br />

All todos are being stored in your DWN

## Question

I designed a role in protocol. I am expecting role can limit read access. but it does not work as expected.

## Detail

### type
_subject_, _post_, _premiumPost_, _mySubscriber_

Types _post_ and _premiumPost_ are under _subject_. _Post_ is set to anyone can read/write. The idea of _premiumPost_ is limited to _mySubscriber_ and author can read. But in implementation, it looks like anyone still can read the premiumPost.

### code snippet
Below is part of protocol.
```
"structure": {
    "subject": {
      "$actions": [
        {
          "who": "anyone",
          "can": "read"
        },
        {
          "who": "anyone",
          "can": "write"
        }
      ],
      "mySubscriber": {
        "$contextRole": true,
        "$actions": [
          {
            "who": "anyone",
            "can": "read"
          },
          {
            "who": "author",
            "of": "subject",
            "can": "write"
          }
        ]
      },
      "post": {
        "$actions": [
          {
            "who": "anyone",
            "can": "write"
          },
          {
            "who": "anyone",
            "can": "read"
          }
        ]
      },
      "premiumPost": {
        "$actions": [
          {
            "who": "author",
            "of": "premiumPost",
            "can": "read"
          },
          {
            "who": "anyone",
            "can": "write"
          },
          {
            "role": "subject/mySubscriber",
            "can": "query"
          },
          {
            "role": "subject/mySubscriber",
            "can": "read"
          }
        ]
      }
    }
  }
```

This is how I submit a premiumPost.
```
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
```

## Steps to Reproduce
1. Open a chrome congnito window. go to localhost:5174
2. Fill in subject title and description. Click “create a subject”

  ![Screenshot of step 2](https://github.com/AlexHsieh/BlogSpikeOnWeb5/blob/main/img/step2.png)

3. Select the subject you just created.
4. Fill in post title and content. Click “submit a public post“
1. Click “fetch posts from my remote DWN”

![Screenshot of step 3 to 5](https://github.com/AlexHsieh/BlogSpikeOnWeb5/blob/main/img/step3-5.png)

6. Fill in post title and content. Click “submit a premium post“
1. Click “fetch premium posts from my remote DWN”
   
![Screenshot of step 6 to 7](https://github.com/AlexHsieh/BlogSpikeOnWeb5/blob/main/img/step6-7.png)

8. Open a Safrai private window. go to localhost:5174
9. Click “copy did” from chrome window
    
![Screenshot of step 9](https://github.com/AlexHsieh/BlogSpikeOnWeb5/blob/main/img/step9.png)

11. paste on safrai DID textfield
1. Click “fetch post from did” and “fetch premium post from did”
1. You can see safari success fetch premium post

![Screenshot of step 10-12](https://github.com/AlexHsieh/BlogSpikeOnWeb5/blob/main/img/step10-12.png)
