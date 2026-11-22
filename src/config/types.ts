export type CategoryId = 'character' | 'environment' | 'modeling' | 'animation' | 'experimental'

export interface Category {
  id: CategoryId
  /** shown as "01", "02"… — keep them in order */
  index: string
  label: string
  blurb: string
}

interface MediaBase {
  /** path inside /public, e.g. "/projects/my-slug/cover.webp" */
  src: string
  /** intrinsic size of the file — only the ratio matters, it keeps the layout from jumping */
  width: number
  height: number
  alt: string
  caption?: string
}

export interface ImageMedia extends MediaBase {
  type: 'image'
  /** optional smaller version (~960px) used on phones and in thumbnails */
  srcSmall?: string
}

export interface VideoMedia extends MediaBase {
  type: 'video'
  /** still frame shown before playback */
  poster: string
  /** true only if the file has a sound track — shows the "Sound" toggle */
  hasAudio?: boolean
}

export type Media = ImageMedia | VideoMedia

export interface ProcessStep {
  title: string
  text: string
  media?: Media
}

export interface Project {
  /** URL part: /work/<slug> */
  slug: string
  title: string
  category: CategoryId
  year: number
  /** one or two sentences — shown in the gallery and at the top of the project page */
  summary: string
  cover: ImageMedia
  /** "demo" adds a visible "demo slot" badge so placeholder work is never mistaken for real work */
  status: 'published' | 'demo'
  idea: string[]
  /** optional film / loop shown right after the idea */
  film?: VideoMedia
  process: ProcessStep[]
  gallery: Media[]
  /** facts only — leave out anything you don't know */
  tech: { label: string; value: string }[]
  tools: string[]
}

export interface Contact {
  label: string
  /** the visible handle / address; empty string = not set yet (rendered as a muted, non-clickable row) */
  value: string
  /** full URL; for email leave empty — mailto: is built automatically */
  url: string
}

export interface Tool {
  name: string
  /** what it is used for, in plain words */
  role: string
  /** which disciplines (sockets on the output node) this tool feeds */
  feeds: string[]
}

export interface SiteConfig {
  brand: {
    nick: string
    signature: string
    role: string
    description: string
    /** used in <title> and social previews */
    siteTitle: string
  }
  hero: {
    statement: string
  }
  about: {
    headline: string
    lines: string[]
    bio: string[]
  }
  disciplines: string[]
  tools: Tool[]
  contact: {
    headline: string[]
    /** index of the headline line drawn as outline ("wireframe") that fills on hover */
    outlineLine: number
    email: string
    socials: Contact[]
    /** show socials that have no value yet as muted rows ("not linked yet") */
    showEmpty: boolean
  }
  categories: Category[]
  projects: Project[]
}
