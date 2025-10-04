"use client"

import { useState, useEffect } from 'react'
import { validateSlug, validateEmail } from '../config'

/**
 * Hook para validación de slug en tiempo real
 */
export function useSlugValidation(slug: string, debounceMs: number = 500) {
  const [validation, setValidation] = useState({
    isValid: false,
    message: '',
    isChecking: false
  })

  useEffect(() => {
    if (!slug) {
      setValidation({ isValid: true, message: '', isChecking: false })
      return
    }

    // Validación básica primero
    const basicValidation = validateSlug(slug)
    if (!basicValidation.isValid) {
      setValidation({
        isValid: false,
        message: basicValidation.message || '',
        isChecking: false
      })
      return
    }

    // Validación en servidor con debounce
    const timer = setTimeout(async () => {
      setValidation(prev => ({ ...prev, isChecking: true }))
      
      try {
        const response = await fetch(`/api/admin/invitations/validate-slug?slug=${encodeURIComponent(slug)}`)
        const data = await response.json()

        if (response.ok) {
          setValidation({
            isValid: true,
            message: '✅ Slug disponible',
            isChecking: false
          })
        } else {
          setValidation({
            isValid: false,
            message: `❌ ${data.message}`,
            isChecking: false
          })
        }
      } catch (error) {
        setValidation({
          isValid: false,
          message: '❌ Error al verificar slug',
          isChecking: false
        })
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [slug, debounceMs])

  return validation
}

/**
 * Hook para validación de email en tiempo real
 */
export function useEmailValidation(email: string, debounceMs: number = 500) {
  const [validation, setValidation] = useState({
    isValid: false,
    message: '',
    isChecking: false
  })

  useEffect(() => {
    if (!email) {
      setValidation({ isValid: true, message: '', isChecking: false })
      return
    }

    // Validación básica primero
    const basicValidation = validateEmail(email)
    if (!basicValidation.isValid) {
      setValidation({
        isValid: false,
        message: basicValidation.message || '',
        isChecking: false
      })
      return
    }

    // Validación en servidor con debounce
    const timer = setTimeout(async () => {
      setValidation(prev => ({ ...prev, isChecking: true }))
      
      try {
        const response = await fetch(`/api/admin/invitations/validate-email?email=${encodeURIComponent(email)}`)
        const data = await response.json()

        if (response.ok) {
          setValidation({
            isValid: true,
            message: '✅ Email disponible',
            isChecking: false
          })
        } else {
          setValidation({
            isValid: false,
            message: `❌ ${data.message}`,
            isChecking: false
          })
        }
      } catch (error) {
        setValidation({
          isValid: false,
          message: '❌ Error al verificar email',
          isChecking: false
        })
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [email, debounceMs])

  return validation
}
