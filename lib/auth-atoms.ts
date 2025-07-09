import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export interface AuthUser {
  id: string
  email: string
  name: string
}

// Auth state atoms
export const authUserAtom = atom<AuthUser | null>(null)
export const authLoadingAtom = atom<boolean>(false)
export const authTokenAtom = atomWithStorage<string | null>("auth-token", null)

// Derived atoms
export const isAuthenticatedAtom = atom((get) => get(authUserAtom) !== null)
