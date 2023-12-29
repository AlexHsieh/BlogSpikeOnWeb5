<script lang="ts" setup>
import { computed, onBeforeMount, onMounted, ref, toRaw } from "vue";
import { PlusIcon as PlusIconMini } from "@heroicons/vue/solid";
import { CheckCircleIcon, TrashIcon } from "@heroicons/vue/outline";
import { Web5, Record } from "@web5/api";
import protocolDefinition from "../src/protocols/post-protocol.json";
import {
  configureProtocol,
  forceInstallProtocol,
} from "./protocols/ConfigProtocol";
import { createRegularPost } from "./composables/PostCreation";
import {
  submitPublicPostAndSendToDwn,
  submitPremiumPostAndSendToDwn,
  fetchPostsfromDwn,
  fetchPremiumPostsfromDwn,
} from "./methods/PostMethods";
import type { Post } from "./composables/PostCreation";
import type { Subject, SubjectObject } from "./composables/SubjectCreation";
import {
  submitSubjectAndSendToDwn,
  fetchSubjectsfromDwn,
  addSubscriberToSubject,
} from "./methods/SubjectMethods";
import { asyncComputed } from "@vueuse/core";

let web5: Web5;
const myDid = ref("");

const subjectRecords = ref<Record[]>([]);
const subjects = asyncComputed(async () => {
  let objects: SubjectObject[] = [];
  for (const record of subjectRecords.value) {
    let data = await record.data.json();
    objects.push({
      recordId: record.id,
      title: data.title,
      description: data.description,
      authorDid: data.authorDid,
    });
  }
  return objects;
});
const subjectTitle = ref("");
const subjectDescription = ref("");
let selectedSubject = ref<SubjectObject | undefined>();

let posts = ref<Post[]>([]);
let premiumPosts = ref<Post[]>([]);

let postTitle = ref("");
let postText = ref("");

let didToPull = ref("");
let subscriberDid = ref("");

onBeforeMount(async () => {
  const web5Result = await Web5.connect();
  web5 = web5Result.web5;
  myDid.value = web5Result.did;

  await configureProtocol(web5, myDid.value, protocolDefinition);
  await fetchSubjects();
});

const fetchSubjects = async () => {
  const { records, status } = await fetchSubjectsfromDwn(web5, myDid.value);
  console.log("fetchSubjects status:", status);

  subjectRecords.value = [];
  if (records) {
    for (let record of records) {
      subjectRecords.value.push(record);
    }
  }
  console.log("total subjects:", subjectRecords.value.length);
};

const submitSubject = async () => {
  let aSubject: Subject = {
    title: subjectTitle.value,
    description: subjectDescription.value,
    authorDid: myDid.value,
  };
  const { record, status } = await submitSubjectAndSendToDwn(aSubject, web5);
  console.log("submitSubject status:", status);
  if (record) {
    subjectRecords.value.push(record);
  }
};

const submitPublicPost = async () => {
  let aPost = createRegularPost({
    title: postTitle.value,
    text: postText.value,
    authorDid: myDid.value,
  });

  const subjectRecordId = selectedSubject.value?.recordId;
  if (subjectRecordId) {
    const { record, status } = await submitPublicPostAndSendToDwn(
      aPost,
      web5,
      subjectRecordId
    );
    console.log("submitPublicPost status:", status);
  } else {
    console.log("No subject selected");
  }
};

const submitPremiumPost = async () => {
  let aPost = createRegularPost({
    title: postTitle.value,
    text: postText.value,
    authorDid: myDid.value,
  });

  const subjectRecordId = selectedSubject.value?.recordId;
  if (subjectRecordId) {
    const { record, status } = await submitPremiumPostAndSendToDwn(
      aPost,
      web5,
      subjectRecordId
    );
    console.log("submitPremiumPost status:", status);
  } else {
    console.log("No subject selected");
  }
};

const addSubscriber = async () => {
  let subject: Record;
  subjectRecords.value.map((record) => {
    if (record.id === selectedSubject.value?.recordId) {
      subject = record;
    }
  });

  if (subject) {
    const { record, status } = await addSubscriberToSubject(
      web5,
      subject,
      subscriberDid.value
    );
    console.log("add subscriber status:", status);
  } else {
    console.log("No subject selected");
  }
};

const fetchPosts = async () => {
  const { records, status } = await fetchPostsfromDwn(web5, didToPull.value);
  console.log("fetchPosts status:", status);

  posts.value = [];
  for (let record of records) {
    let data = await record.data.json();
    let post = createRegularPost(data);
    posts.value.push(post);
  }
  console.log("total posts:", posts.value.length);
};

const fetchPostsFromMyDwn = async () => {
  const { records, status } = await fetchPostsfromDwn(web5, myDid.value);
  console.log("fetchPosts status:", status);

  posts.value = [];
  if (records) {
    for (let record of records) {
      let data = await record.data.json();
      let post = createRegularPost(data);
      posts.value.push(post);
    }
  }
  console.log("total posts:", posts.value.length);
};

const fetchPremiumPosts = async () => {
  const { records, status } = await fetchPremiumPostsfromDwn(
    web5,
    didToPull.value
  );
  console.log("fetchPremiumPosts status:", status);

  premiumPosts.value = [];
  for (let record of records) {
    let data = await record.data.json();
    let post = createRegularPost(data);
    premiumPosts.value.push(post);
  }
  console.log("total posts:", premiumPosts.value.length);
};

const fetchPremiumPostsFromMyDwn = async () => {
  const { records, status } = await fetchPremiumPostsfromDwn(web5, myDid.value);
  console.log("fetchPremiumPosts status:", status);

  premiumPosts.value = [];
  if (records) {
    for (let record of records) {
      let data = await record.data.json();
      let post = createRegularPost(data);
      premiumPosts.value.push(post);
    }
  }
  console.log("total premiumPosts:", premiumPosts.value.length);
};

const copyDID = async () => {
  await navigator.clipboard.writeText(myDid.value);
  alert("DID copied to clipboard");
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-full px-8 py-12 sm:px-6"
  >
    <!-- Title -->
    <div class="max-w-5xl lg:w-full">
      <h2 class="font-bold text-3xl text-center tracking-tight">Blog post</h2>
      <div class="flex items-center justify-center">
        <div v-if="!myDid" id="mydid-container">Connecting to web5 . . .</div>
        <div v-else id="mydid-container" class="flex flex-col w-full">
          <div>Web5 Connected:</div>
          <div>{{ myDid }}</div>
        </div>
      </div>
    </div>

    <div class="mt-8 mb-8">
      <button class="button" @click="copyDID">COPY DID</button>
    </div>

    <div class="mt-8 mb-8">
      <button class="button" @click="submitSubject">create a subject</button>
      <label class="label">subject title</label>
      <input type="text" v-model="subjectTitle" />
      <label class="label">description</label>
      <input type="text" v-model="subjectDescription" />

      <div class="mt-5">
        <fieldset>
          <ul class="flex flex-row flex-wrap">
            <li
              v-for="subject in subjects"
              :key="subject.recordId"
              class="h-8 w-1/2"
            >
              <input
                :id="subject.recordId"
                type="radio"
                :value="subject"
                v-model="selectedSubject"
                class="m-3"
              />
              <label :for="subject.recordId">{{ subject.title }}</label>
            </li>
          </ul>
        </fieldset>
      </div>
    </div>

    <div class="mt-8 mb-8">
      <button class="button" @click="submitPublicPost">
        Submit a public post
      </button>
      <label class="label"> post title </label>
      <input type="text" v-model="postTitle" />
      <label class="label"> post content </label>
      <input type="text" v-model="postText" />
      <button class="button" @click="submitPremiumPost">
        Submit a premunium post
      </button>
    </div>

    <div class="mt-8 mb-8">
      <button class="button" @click="addSubscriber">Add subscriber</button>
      <label class="label"> subscriber DID</label>
      <input type="text" v-model="subscriberDid" />
    </div>

    <div class="mt-8 mb-8 flex flex-row">
      <button class="button" @click="fetchPostsFromMyDwn">
        Fetch posts from my remote DWN
      </button>
      <button class="button" @click="fetchPosts">Fetch Post from did</button>
      <label class="label"> DID </label>
      <input type="text" v-model="didToPull" />
    </div>

    <div>
      <div
        v-for="post in posts"
        :key="1"
        class="rounded-lg border-spacing-1 border-green-300 border p-4"
      >
        {{ post.title }}, {{ post.text }}
      </div>
    </div>

    <div class="mt-8 mb-8 flex flex-row">
      <button class="button" @click="fetchPremiumPostsFromMyDwn">
        Fetch premium posts from my remote DWN
      </button>
      <button class="button" @click="fetchPremiumPosts">
        Fetch premium post from did
      </button>
      <label class="label"> DID </label>
      <input type="text" v-model="didToPull" />
    </div>

    <div>
      <div
        v-for="post in premiumPosts"
        :key="1"
        class="rounded-lg border-spacing-1 border-green-300 border p-4"
      >
        {{ post.title }}, {{ post.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.button {
  @apply bg-blue-500 text-white p-2 mr-2 ml-2 rounded;
}
.label {
  @apply p-1 mr-1 ml-4;
}
</style>
