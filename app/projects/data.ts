export type ProjectNode = {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  tags: string[];
  repoUrl?: string;
  liveUrl?: string;
  left?: ProjectNode;
  right?: ProjectNode;
};

export const projectTree: ProjectNode = {
  id: 'root',
  slug: 'portfolio-summit',
  title: 'Portfolio Summit',
  blurb: 'Overview of personal projects',
  tags: ['nextjs', 'typescript'],
  left: {
    id: 'fraud-analytics',
    slug: 'fraud-analytics',
    title: 'Fraud Analytics',
    blurb: 'LNRS internal tooling',
    tags: ['python', 'data'],
    left: {
      id: 'typing-speed',
      slug: 'typing-speed-webapp',
      title: 'Typing Speed Webapp',
      blurb: 'Practice typing',
      tags: ['react', 'game'],
    },
    right: {
      id: 'unity-community',
      slug: 'unity-community',
      title: 'Unity Community',
      blurb: 'AR/VR meetups',
      tags: ['unity', 'ar', 'vr'],
      left: {
        id: 'knowtrients',
        slug: 'knowtrients',
        title: 'Knowtrients',
        blurb: 'Nutrition tracker',
        tags: ['nextjs', 'health'],
      },
    },
  },
  right: {
    id: 'side-quests',
    slug: 'side-quests',
    title: 'Side Quests',
    blurb: 'Miscellaneous builds',
    tags: ['experiment'],
    right: {
      id: 'portfolio-v1',
      slug: 'portfolio-v1',
      title: 'Portfolio v1',
      blurb: 'Earlier iteration',
      tags: ['nextjs'],
    },
  },
};
