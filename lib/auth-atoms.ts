import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export interface User {
  id: string
  email: string
  name: string
}

export const authUserAtom = atomWithStorage<User | null>("auth-user", null)
export const authLoadingAtom = atom(false)
