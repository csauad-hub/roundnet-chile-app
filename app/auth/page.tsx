'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Mail, Lock } from 'lucide-react'
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    setTimeout(() => { setLoading(false); window.location.href='/' }, 1000)
  }
  return (<div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-1" style={{background:'linear-gradient(90deg,#C8102E 40%,#1A3A8F 40%)'}} />
    <div className="absolute w-96 h-96 rounded-full bg-blue-50 -top-24 -right-32" />
    <div className="absolute w-64 h-64 rounded-full bg-red-50 -bottom-16 -left-24" />
    <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="font-display font-black text-4xl text-blue-600 mb-2">RN<span className="text-red-500">CL</span></div>
      <h1 className="font-display font-black text-2xl text-blue-600">Roundnet <span className="text-red-500">Chile</span></h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">La comunidad nacional</p>
      <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); window.location.href='/' }, 1000) }} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-xl py-3.5 text-sm font-semibold text-slate-700 hover:border-blue-300 mb-4 shadow-sm">
        <span className="text-blue-500 font-bold">G</span> Continuar con Google
      </button>
      <div className="w-full flex items-center gap-3 my-1"><div className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-400">o con email</span><div className="flex-1 h-px bg-slate-200" /></div>
      <form onSubmit={handleLogin} className="w-full mt-4 space-y-3">
        <div className="card flex items-center gap-2.5 px-4 py-3"><Mail size={15} className="text-slate-400" /><input type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 text-sm outline-none bg-transparent placeholder-slate-400" required /></div>
        <div className="card flex items-center gap-2.5 px-4 py-3"><Lock size={15} className="text-slate-400" /><input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 text-sm outline-none bg-transparent placeholder-slate-400" required /></div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">{loading?'Ingresando...':'Ingresar'}</button>
      </form>
      <p className="text-xs text-slate-400 mt-6">¿No tienes cuenta? <Link href="/auth/registro" className="text-blue-600 font-semibold">Regístrate gratis</Link></p>
    </div>
  </div>)
}