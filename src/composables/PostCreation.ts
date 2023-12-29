export enum PostRole {
  Anyone,
  Subscriber,
}

export enum PostLevel {
  Regular,
  Premium,
}

export interface Post {
  title: string;
  text: string;
  role: PostRole;
  level: PostLevel;
  authorDid: string;
}

export const createRegularPost = (post: Partial<Post>): Post => {
  return {
    title: "",
    text: "",
    role: PostRole.Anyone,
    level: PostLevel.Regular,
    authorDid: "",
    ...post,
  };
};
