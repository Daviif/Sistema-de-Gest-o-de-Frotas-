import { create } from 'zustand'

type AuthUser = {
	id: string
	name: string
	email?: string
}

type AuthState = {
	token: string | null
	user: AuthUser | null
	isAuthenticated: boolean
	login: (payload: { token: string; user: AuthUser }) => void
	logout: () => void
	setToken: (token: string | null) => void
	setUser: (user: AuthUser | null) => void
	hydrateFromStorage: () => void
}

const AUTH_STORAGE_KEY = 'frota.auth'

function readAuthFromStorage(): { token: string | null; user: AuthUser | null } {
	if (typeof window === 'undefined') return { token: null, user: null }

	const raw = localStorage.getItem(AUTH_STORAGE_KEY)
	if (!raw) return { token: null, user: null }

	try {
		const parsed = JSON.parse(raw) as { token?: string; user?: AuthUser }
		return {
			token: parsed.token ?? null,
			user: parsed.user ?? null,
		}
	} catch {
		return { token: null, user: null }
	}
}

function writeAuthToStorage(value: { token: string | null; user: AuthUser | null }) {
	if (typeof window === 'undefined') return

	if (!value.token && !value.user) {
		localStorage.removeItem(AUTH_STORAGE_KEY)
		return
	}

	localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value))
}

const initial = readAuthFromStorage()

export const useAuthStore = create<AuthState>((set, get) => ({
	token: initial.token,
	user: initial.user,
	isAuthenticated: !!initial.token,

	login: ({ token, user }) => {
		const next = { token, user }
		writeAuthToStorage(next)
		set({ token, user, isAuthenticated: true })
	},

	logout: () => {
		writeAuthToStorage({ token: null, user: null })
		set({ token: null, user: null, isAuthenticated: false })
	},

	setToken: (token) => {
		const user = get().user
		const next = { token, user }
		writeAuthToStorage(next)
		set({ token, isAuthenticated: !!token })
	},

	setUser: (user) => {
		const token = get().token
		const next = { token, user }
		writeAuthToStorage(next)
		set({ user, isAuthenticated: !!token })
	},

	hydrateFromStorage: () => {
		const value = readAuthFromStorage()
		set({
			token: value.token,
			user: value.user,
			isAuthenticated: !!value.token,
		})
	},
}))

export type { AuthState, AuthUser }
