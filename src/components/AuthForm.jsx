import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const action = mode === 'login' ? signIn : signUp
    const { error } = await action(email, password)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage(
        mode === 'login'
          ? 'Login realizado com sucesso.'
          : 'Conta criada. Verifique seu email se a confirmação estiver habilitada.'
      )
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-6 space-y-4"
      >
        <div>
          <h1 className="text-2xl font-black">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Salve suas fichas por conta usando Supabase
          </p>
        </div>

        <input
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-white px-4 py-2 font-black text-black disabled:opacity-60"
        >
          {loading
            ? 'Carregando...'
            : mode === 'login'
            ? 'Entrar'
            : 'Criar conta'}
        </button>

        <button
          type="button"
          onClick={() =>
            setMode((prev) => (prev === 'login' ? 'register' : 'login'))
          }
          className="w-full rounded-2xl border border-zinc-700 px-4 py-2 text-sm"
        >
          {mode === 'login'
            ? 'Não tem conta? Criar conta'
            : 'Já tem conta? Entrar'}
        </button>

        {message && (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm">
            {message}
          </div>
        )}
      </form>
    </div>
  )
}