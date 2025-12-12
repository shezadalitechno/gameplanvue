import type { GPComment } from '~/types/gameplan'
import { isToday, isInRange } from '../utils/dateUtils'
import { getAllComments as apiGetAllComments } from './api'

export function getAllComments(): Promise<GPComment[]> {
  return apiGetAllComments()
}

export function getCommentsByUser(comments: GPComment[], email: string): GPComment[] {
  return comments.filter(comment => comment.owner === email)
}

export function getCommentsToday(comments: GPComment[]): GPComment[] {
  return comments.filter(comment => {
    if (!comment.creation) return false
    return isToday(new Date(comment.creation))
  })
}

export function getCommentsByDate(comments: GPComment[], date: Date): GPComment[] {
  return comments.filter(comment => {
    if (!comment.creation) return false
    const commentDate = new Date(comment.creation)
    return commentDate.toDateString() === date.toDateString()
  })
}

export function getCommentsByTask(comments: GPComment[], taskName: string): GPComment[] {
  return comments.filter(comment => comment.reference_name === taskName && comment.reference_doctype === 'GP Task')
}

export function getCommentsInRange(comments: GPComment[], startDate: Date, endDate: Date): GPComment[] {
  return comments.filter(comment => {
    if (!comment.creation) return false
    return isInRange(new Date(comment.creation), startDate, endDate)
  })
}

