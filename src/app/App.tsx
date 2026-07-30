import { PublicationsPage } from '@/studio/publications'

const publications = [
  {
    id: 'adhd-emotional-regulation-journal',
    title: 'ADHD Emotional Regulation Journal',
    description:
      'A supportive journal for noticing emotions, understanding patterns, and choosing gentle next steps.',
    updatedAt: 'July 29, 2026',
    status: 'draft' as const,
  },
  {
    id: 'daily-clarity-planner',
    title: 'Daily Clarity Planner',
    description:
      'A calm daily planning system designed to make priorities feel clear and manageable.',
    updatedAt: 'July 28, 2026',
    status: 'published' as const,
  },
]

export function App() {
  return <PublicationsPage publications={publications} />
}
