import type { AvatarProps } from '@nuxt/ui'

export interface GPTask {
  name: string
  title?: string
  status?: string
  priority?: string
  assigned_to?: string
  due_date?: string
  modified?: string
  creation?: string
  project?: string
  team?: string
  description?: string
  [key: string]: any // Allow additional fields
}

export interface GPComment {
  name: string
  owner?: string
  content?: string
  creation?: string
  modified?: string
  reference_name?: string
  reference_doctype?: string
  [key: string]: any
}

export interface GPActivity {
  name: string
  owner?: string
  action?: string
  creation?: string
  modified?: string
  reference_name?: string
  reference_doctype?: string
  [key: string]: any
}

export interface GPProject {
  name: string
  title?: string
  team?: string
  status?: string
  [key: string]: any
}

export interface GPTeam {
  name: string
  title?: string
  [key: string]: any
}

export interface GPUserProfile {
  name: string
  email?: string
  full_name?: string
  avatar?: AvatarProps
  [key: string]: any
}

