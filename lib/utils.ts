import { parse, isDate } from 'date-fns'

export function generateInviteCode(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  let result = ""

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

export function parseJsonFromLlmResponse(content: string) {
  const blockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const jsonText = blockMatch
    ? blockMatch[1]
    : extractJsonByBrackets(content)

  try {
    return JSON.parse(jsonText)
  } catch (err) {
    throw new Error('Invalid JSON: ' + err.message)
  }
}

function extractJsonByBrackets(text: string): string {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1)
  }
  throw new Error('Invalid JSON.')
}

export function normalizeContractData(data: any): any {
  const safeString = (val: any) => typeof val === 'string' ? val : ''

  data.signingDate = normalizeDate(data.signingDate)
  data.startDate = normalizeDate(data.startDate)
  data.endDate = normalizeDate(data.endDate)

  if (Array.isArray(data.obligations)) {
    data.obligations = data.obligations.map(o => ({
      ...o,
      dueDate: normalizeDate(o.dueDate),
      recurrence: safeString(o.recurrence),
    }))
  }

  if (Array.isArray(data.terminationClauses)) {
    data.terminationClauses = data.terminationClauses.map(c => ({
      ...c,
      cause: safeString(c.cause),
    }))
  }

  if (Array.isArray(data.deadlines)) {
    data.deadlines = data.deadlines
      .map(d => ({
        ...d,
        date: normalizeDate(d.date),
      }))
      .filter(d => typeof d.date === 'string' && d.date.trim() !== '')
  }

  return data
}


import { parseISO, isValid } from 'date-fns'

function normalizeDate(input: any): string | null {
  if (typeof input !== 'string' || input.trim() === '') return null

  const trimmed = input.trim()

  const isoParsed = parseISO(trimmed)
  if (isValid(isoParsed)) return isoParsed.toISOString()

  const match = trimmed.match(/\d{2}\/\d{2}\/\d{4}/)
  if (match) {
    const parsed = parse(match[0], 'dd/MM/yyyy', new Date())
    return isValid(parsed) ? parsed.toISOString() : null
  }

  return null
}


