import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Known pre-deleted test exhibition IDs that were deleted by the organizer
const INITIAL_DELETED_IDS = [
  '7acf3dde-268b-4a0e-91e8-37b7f1b7b2dd', // "ت"
  '7344b7b5-38b1-42fc-94cc-b4c0045df35e', // "o"
  '7a5fa51b-4797-4565-a3ab-dc97f4ff9756', // "h"
  '14ea5a76-abbb-4014-a516-a604cbba0daa', // "معرض التمور"
]

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'deleted_exhibitions.json')

// In-memory cache for fast sync lookups
let inMemoryDeletedSet: Set<string> | null = null

export async function getDeletedExhibitionIds(): Promise<Set<string>> {
  if (inMemoryDeletedSet) {
    return inMemoryDeletedSet
  }

  try {
    const raw = await readFile(DATA_FILE_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      inMemoryDeletedSet = new Set([...INITIAL_DELETED_IDS, ...parsed])
      return inMemoryDeletedSet
    }
  } catch {
    // If file does not exist yet, initialize it with INITIAL_DELETED_IDS
    try {
      const dir = path.dirname(DATA_FILE_PATH)
      await mkdir(dir, { recursive: true })
      await writeFile(DATA_FILE_PATH, JSON.stringify(INITIAL_DELETED_IDS, null, 2), 'utf-8')
    } catch (writeErr) {
      console.warn('Notice writing initial deleted_exhibitions.json:', writeErr)
    }
  }

  inMemoryDeletedSet = new Set(INITIAL_DELETED_IDS)
  return inMemoryDeletedSet
}

export async function addDeletedExhibitionId(id: string): Promise<void> {
  if (!id) return
  const currentSet = await getDeletedExhibitionIds()
  currentSet.add(id)
  inMemoryDeletedSet = currentSet

  try {
    const dir = path.dirname(DATA_FILE_PATH)
    await mkdir(dir, { recursive: true })
    const array = Array.from(currentSet)
    await writeFile(DATA_FILE_PATH, JSON.stringify(array, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving deleted exhibition ID to file:', err)
  }
}

export async function isExhibitionDeleted(id: string): Promise<boolean> {
  if (!id) return false
  const deletedSet = await getDeletedExhibitionIds()
  return deletedSet.has(id)
}
