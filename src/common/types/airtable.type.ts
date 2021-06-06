export type ReviewApprovalStatus = 'Approved' | 'Rejected'

export type AirtableReviewFields = {
  reviewId: string
  status: ReviewApprovalStatus
}

export interface AirtableRecord {
  id: string
  fields: AirtableReviewFields
  createdTime: string
}
