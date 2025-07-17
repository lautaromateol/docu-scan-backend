import { z } from 'zod'

const ContractCategory = z.enum(['TRANSFER', 'USE', 'SERVICES', 'GUARANTEE', 'COLABORATION'])
const ContractStatus = z.enum(['DRAFT', 'SIGNED', 'EXPIRED', 'TERMINATED']).optional()
const ObligationType = z.enum(['PRIMARY', 'ACCESSORY', 'CONDITIONAL', 'RECURRING'])
const ClauseType = z.enum(['GENERAL', 'CONFIDENTIALITY', 'PENALTY', 'JURISDICTION', 'OTHER'])

export const ContractSchema = z.object({
  title: z.string(),
  category: ContractCategory,
  status: ContractStatus,
  descriptionSummary: z.string().nullable().optional(),
  jurisdiction: z.string().nullable().optional(),
  governingLaw: z.string().nullable().optional(),
  signingDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),

  parties: z.array(z.object({
    name: z.string(),
    identifier: z.string().nullable().optional(),
    role: z.string(),
  })),

  obligations: z.array(z.object({
    partyName: z.string(),
    description: z.string(),
    type: ObligationType,
    dueDate: z.string().datetime().nullable().optional(),
    recurrence: z.string().nullable().optional(),
  })),

  terminationClauses: z.array(z.object({
    description: z.string(),
    cause: z.string(),
    noticePeriodDays: z.number().int().nullable().optional(),
  })),

  deadlines: z.array(z.object({
    description: z.string(),
    date: z.string().datetime(),
    type: z.string(),
  })),

  clauses: z.array(z.object({
    title: z.string(),
    bodyText: z.string(),
    clauseType: ClauseType,
  })),
})
