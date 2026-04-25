export type AnnonceCondition = 'new'|'like_new'|'good'|'fair'|'for_parts'
export type AccountType = 'particulier'|'pro'

export interface AnnonceImage { id: number; url: string; alt?: string; isMain?: boolean }
export interface SellerProfile { id: number; username: string; avatar?: string; companyName?: string; city: string; activeAdsCount: number; phone?: string }

export interface AnnonceDetail {
  id: number
  title: string
  description: string
  price: number | null
  isFree: boolean
  isPriceNegotiable: boolean
  condition: AnnonceCondition
  category: string
  subCategory?: string
  city: string
  postalCode?: string
  images: AnnonceImage[]
  isUrgent?: boolean
  seller: SellerProfile
}

export interface SimilarAnnonce { id: number; title: string; price: number | null; isFree: boolean; city: string; mainImage?: string; publishedAt: string; isUrgent?: boolean; seller: { accountType: AccountType } }

export interface ReportForm { reason: string; description: string }
