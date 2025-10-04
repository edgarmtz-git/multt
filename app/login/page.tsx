import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  
  return (
    <AuthLayout>
      <LoginForm error={params?.error} />
    </AuthLayout>
  )
}
