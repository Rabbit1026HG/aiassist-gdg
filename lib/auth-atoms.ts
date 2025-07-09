import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export interface User {
  id: string
  email: string
  name: string
  provider: "email" | "google"
}

export const authUserAtom = atom<User | null>(null)
export const authLoadingAtom = atom<boolean>(false)
export const authTokenAtom = atomWithStorage<string | null>("auth-token", null)
