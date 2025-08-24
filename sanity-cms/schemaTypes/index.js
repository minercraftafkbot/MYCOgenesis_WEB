import { product } from './product'
import { category } from './category'
import { blogPost } from './blogPost'
import { researchArticle } from './researchArticle'
import { teamMember } from './teamMember'
import { businessPage } from './businessPage'
import { tutorialGuide } from './tutorialGuide'
import { faq, faqCategory } from './faq'

export const schemaTypes = [
  // Product & Category Schemas
  product,
  category,
  
  // Content Schemas
  blogPost,
  researchArticle,
  tutorialGuide,
  businessPage,
  
  // FAQ Schemas
  faq,
  faqCategory,
  
  // Team Schema
  teamMember
]
