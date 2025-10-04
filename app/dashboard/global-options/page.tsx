'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Type, 
  Hash, 
  Calendar, 
  CheckSquare, 
  List, 
  Image,
  AlertTriangle,
  Info,
  Layers,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'

interface GlobalOptionChoice {
  id?: string
  name: string
  price: number
  availability?: {
    isAvailable: boolean
    reason?: string
  }
}

interface GlobalOption {
  id: string
  name: string
  type: string
  description?: string
  maxSelections?: number
  minSelections?: number
  isRequired: boolean
  isActive: boolean
  order: number
  choices: GlobalOptionChoice[]
  availability?: {
    isAvailable: boolean
    reason?: string
  }
}

export default function GlobalOptionsPage() {
  const { data: session } = useSession()
  const [globalOptions, setGlobalOptions] = useState<GlobalOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingOption, setEditingOption] = useState<GlobalOption | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'checkbox',
    description: '',
    maxSelections: null as number | null,
    minSelections: null as number | null,
    isRequired: false,
    choices: [] as GlobalOptionChoice[]
  })

  useEffect(() => {
    loadGlobalOptions()
  }, [])

  const loadGlobalOptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/global-options', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setGlobalOptions(data)
      } else if (response.status === 401) {
        setGlobalOptions([])
      } else {
        console.error('Error loading global options:', response.status)
        setGlobalOptions([])
      }
    } catch (error) {
      console.error('Error loading global options:', error)
      setGlobalOptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const url = editingOption 
        ? `/api/dashboard/global-options/${editingOption.id}`
        : '/api/dashboard/global-options'
      
      const method = editingOption ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingOption ? 'Opción actualizada' : 'Opción creada')
        setShowForm(false)
        setEditingOption(null)
        resetForm()
        loadGlobalOptions()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error saving global option:', error)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (option: GlobalOption) => {
    setEditingOption(option)
    setFormData({
      name: option.name,
      type: option.type,
      description: option.description || '',
      maxSelections: option.maxSelections || null,
      minSelections: option.minSelections || null,
      isRequired: option.isRequired,
      choices: option.choices || []
    })
    setShowForm(true)
  }

  const handleDelete = async (optionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta opción global?')) {
      return
    }

    try {
      const response = await fetch(`/api/dashboard/global-options/${optionId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Opción eliminada')
        loadGlobalOptions()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting global option:', error)
      toast.error('Error al eliminar')
    }
  }

  const handleToggleAvailability = async (optionId: string, isAvailable: boolean, reason?: string) => {
    try {
      const response = await fetch(`/api/dashboard/global-options/${optionId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isAvailable, reason })
      })

      if (response.ok) {
        toast.success(isAvailable ? 'Opción activada' : 'Opción desactivada')
        loadGlobalOptions()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar disponibilidad')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Error al actualizar disponibilidad')
    }
  }

  const handleToggleChoiceAvailability = async (optionId: string, choiceId: string, isAvailable: boolean, reason?: string) => {
    try {
      const response = await fetch(`/api/dashboard/global-options/${optionId}/choices/${choiceId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isAvailable, reason })
      })

      if (response.ok) {
        toast.success(isAvailable ? 'Elección activada' : 'Elección desactivada')
        loadGlobalOptions()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar disponibilidad')
      }
    } catch (error) {
      console.error('Error updating choice availability:', error)
      toast.error('Error al actualizar disponibilidad')
    }
  }

  const toggleCardExpansion = (optionId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(optionId)) {
        newSet.delete(optionId)
      } else {
        newSet.add(optionId)
      }
      return newSet
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'checkbox',
      description: '',
      maxSelections: null,
      minSelections: null,
      isRequired: false,
      choices: []
    })
  }

  const addChoice = () => {
    setFormData(prev => ({
      ...prev,
      choices: [...prev.choices, { name: '', price: 0 }]
    }))
  }

  const updateChoice = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      choices: prev.choices.map((choice, i) => 
        i === index ? { ...choice, [field]: value } : choice
      )
    }))
  }

  const removeChoice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index)
    }))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />
      case 'number': return <Hash className="h-4 w-4" />
      case 'date': return <Calendar className="h-4 w-4" />
      case 'checkbox': return <CheckSquare className="h-4 w-4" />
      case 'select': return <List className="h-4 w-4" />
      case 'media': return <Image className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Texto'
      case 'number': return 'Número'
      case 'date': return 'Fecha'
      case 'checkbox': return 'Casillas'
      case 'select': return 'Selección'
      case 'media': return 'Archivo'
      default: return type
    }
  }

  if (loading) {
    return (
      <DashboardLayout 
        user={{
          name: session?.user?.name || "Usuario",
          email: session?.user?.email || "",
          avatar: session?.user?.avatar || undefined,
          company: session?.user?.company || undefined
        }}
      >
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando opciones globales...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      user={{
        name: session?.user?.name || "Usuario",
        email: session?.user?.email || "",
        avatar: session?.user?.avatar || undefined,
        company: session?.user?.company || undefined
      }}
    >
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Opciones Globales</h1>
          <p className="text-muted-foreground">
            Crea opciones reutilizables para tus productos (como salsas para alitas)
          </p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingOption(null) }} className="mb-6">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Opción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOption ? 'Editar Opción Global' : 'Nueva Opción Global'}
              </DialogTitle>
              <DialogDescription>
                Crea opciones que puedes reutilizar en múltiples productos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la opción</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Salsas para Alitas"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkbox">Casillas múltiples</SelectItem>
                      <SelectItem value="select">Selección única</SelectItem>
                      <SelectItem value="text">Texto libre</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                      <SelectItem value="media">Archivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe esta opción..."
                />
              </div>

              {/* Configuración para opciones checkbox */}
              {formData.type === 'checkbox' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Configuración de límites para casillas
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minSelections">Mínimo de selecciones</Label>
                      <Input
                        id="minSelections"
                        type="number"
                        min="0"
                        value={formData.minSelections || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          minSelections: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxSelections">Máximo de selecciones</Label>
                      <Input
                        id="maxSelections"
                        type="number"
                        min="1"
                        value={formData.maxSelections || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          maxSelections: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        placeholder="Sin límite"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isRequired"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked }))}
                />
                <Label htmlFor="isRequired">Obligatorio</Label>
              </div>

              {/* Elecciones para opciones que las requieren */}
              {(formData.type === 'checkbox' || formData.type === 'select') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Elecciones disponibles</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addChoice}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar elección
                    </Button>
                  </div>
                  
                  {formData.choices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Input
                          value={choice.name}
                          onChange={(e) => updateChoice(index, 'name', e.target.value)}
                          placeholder="Nombre de la elección"
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          step="0.01"
                          value={choice.price}
                          onChange={(e) => updateChoice(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="Precio"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeChoice(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : (editingOption ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lista de opciones globales */}
        <div className="space-y-4">
          {globalOptions.length === 0 ? (
            <div className="grid gap-6">
              {/* Hero Section */}
              <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Layers className="h-10 w-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Opciones Globales</h3>
                  <p className="text-gray-600 text-center max-w-md mb-6">
                    Crea opciones reutilizables que puedes usar en múltiples productos. 
                    Perfecto para salsas, tamaños, extras y más.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={() => { resetForm(); setEditingOption(null); setShowForm(true) }}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Crear mi primera opción
                  </Button>
                </CardContent>
              </Card>

              {/* Ejemplos */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckSquare className="h-5 w-5 text-green-600" />
                      Ejemplo: Salsas para Alitas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Opción tipo "Casillas" con límites de selección
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Buffalo, BBQ, Mango Habanero</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Máximo 3, mínimo 1 selección</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Reutilizable en Alitas 10, 20, 30</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <List className="h-5 w-5 text-blue-600" />
                      Ejemplo: Tamaño de Pizza
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Opción tipo "Selección" con precios diferentes
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Personal ($0), Mediana (+$50), Grande (+$100)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Una sola selección obligatoria</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Reutilizable en todas las pizzas</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Beneficios */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">¿Por qué usar opciones globales?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">Ahorra tiempo</h4>
                        <p className="text-sm text-green-700">Crea una vez, usa en todos tus productos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">Consistencia</h4>
                        <p className="text-sm text-green-700">Mismas opciones en todos los productos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">Fácil gestión</h4>
                        <p className="text-sm text-green-700">Cambia en un lugar, se actualiza en todos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header con estadísticas */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Tus Opciones Globales</h2>
                <p className="text-muted-foreground">
                  {globalOptions.length} opción{globalOptions.length !== 1 ? 'es' : ''} creada{globalOptions.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Lista de opciones */}
              <div className="grid gap-4">
                {globalOptions.map((option) => {
                  const isExpanded = expandedCards.has(option.id)
                  
                  return (
                    <Card key={option.id} className="hover:shadow-md transition-shadow border-l-4 border-l-gray-500">
                      <CardHeader 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleCardExpansion(option.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getTypeIcon(option.type)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{option.name}</CardTitle>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(option.type)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {option.choices.length} elección{option.choices.length !== 1 ? 'es' : ''}
                                </span>
                                {option.maxSelections && (
                                  <span className="text-sm text-muted-foreground">
                                    Máx: {option.maxSelections}
                                  </span>
                                )}
                                {option.minSelections && (
                                  <span className="text-sm text-muted-foreground">
                                    Mín: {option.minSelections}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={option.isActive ? "default" : "secondary"}>
                              {option.isActive ? "Activa" : "Inactiva"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(option)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(option.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            />
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <>
                          {option.description && (
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                            </CardContent>
                          )}
                          
                          {/* Switch de disponibilidad de la opción global */}
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">Disponibilidad de la opción</span>
                                {option.availability?.reason && (
                                  <Badge variant="outline" className="text-xs">
                                    {option.availability.reason}
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={option.availability?.isAvailable ?? true}
                                onCheckedChange={(checked) => handleToggleAvailability(option.id, checked)}
                              />
                            </div>
                          </CardContent>

                          {/* Lista de elecciones con switches individuales */}
                          {option.choices.length > 0 && (
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-gray-700 mb-3">Disponibilidad de elecciones:</h4>
                                {option.choices.map((choice, index) => (
                                  <div key={choice.id || index} className="flex items-center justify-between p-2 border rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{choice.name}</span>
                                      {choice.price > 0 && (
                                        <span className="text-xs text-gray-500">+${choice.price}</span>
                                      )}
                                      {choice.availability?.reason && (
                                        <Badge variant="outline" className="text-xs">
                                          {choice.availability.reason}
                                        </Badge>
                                      )}
                                    </div>
                                    <Switch
                                      checked={choice.availability?.isAvailable ?? true}
                                      onCheckedChange={(checked) => handleToggleChoiceAvailability(option.id, choice.id!, checked)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}