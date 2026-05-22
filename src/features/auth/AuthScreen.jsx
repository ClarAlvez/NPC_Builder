import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { inputStyle } from '../../components/common/Field'

export default function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')

    if (!email || !password) {
      setMessage('Preencha email e senha.')
      setLoading(false)
      return
    }

    const result =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (result.error) {
      setMessage(result.error.message)
    } else {
      setMessage(
        mode === 'login'
          ? 'Login realizado com sucesso.'
          : 'Conta criada com sucesso.'
      )
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl"
      >
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-zinc-300">
            <Sparkles className="h-4 w-4" />

            <span className="text-xs uppercase tracking-[0.32em]">
              Banco de NPCs
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Suas fichas ficam salvas por conta no Supabase.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            className={inputStyle}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            className={inputStyle}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold hover:border-zinc-500"
          >
            {mode === 'login'
              ? 'Não tem conta? Criar conta'
              : 'Já tem conta? Entrar'}
          </button>

          {message && (
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}