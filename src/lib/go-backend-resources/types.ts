export type GoResourceType = "doc" | "video" | "blog" | "course";

export interface GoResourceLink {
  title: string;
  url: string;
  type: GoResourceType;
  source: string;
}

export interface GoResourceSubtopic {
  id: string;
  moduleIndex: number;
  topicIndex: number;
  subtopicIndex: number;
  moduleName: string;
  topicName: string;
  subtopicName: string;
  ongoing?: boolean;
  links: GoResourceLink[];
}

export interface GoResourceModule {
  index: number;
  name: string;
  ongoing?: boolean;
  topics: {
    index: number;
    name: string;
    subtopics: GoResourceSubtopic[];
  }[];
}
