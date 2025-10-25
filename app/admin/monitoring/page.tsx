'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'

interface MonitoringData {
  performance: {
    averageResponseTime: number
    totalRequests: number
    errorRate: number
    uptime: number
  }
  business: {
    totalUsers: number
    activeStores: number
    totalOrders: number
    revenue: number
  }
  errors: {
    critical: number
    warning: number
    info: number
    recent: Array<{
      id: string
      message: string
      level: string
      timestamp: string
      user?: string
      store?: string
    }>
  }
  metrics: {
    performance: Array<{
      name: string
      duration: number
      timestamp: string
    }>
    business: Array<{
      event: string
      userId?: string
      storeSlug?: string
      timestamp: string
    }>
  }
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  const fetchMonitoringData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/monitoring')
      if (!response.ok) throw new Error('Failed to fetch monitoring data')
      const monitoringData = await response.json()
      setData(monitoringData)
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonitoringData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const exportData = () => {
    if (!data) return
    
    const exportData = {
      timestamp: new Date().toISOString(),
      ...data
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monitoring-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando datos de monitoreo...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monitoreo del Sistema</h1>
            <p className="text-muted-foreground">
              Dashboard de observabilidad y métricas de rendimiento
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMonitoringData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.performance.averageResponseTime.toFixed(0)}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio de las últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Error</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.performance.errorRate.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Errores en las últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.business.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de usuarios registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiendas Activas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.business.activeStores}
              </div>
              <p className="text-xs text-muted-foreground">
                Tiendas operativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="business">Negocio</TabsTrigger>
            <TabsTrigger value="errors">Errores</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Tiempo de Respuesta Promedio</p>
                      <p className="text-2xl font-bold">{data?.performance.averageResponseTime.toFixed(0)}ms</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total de Requests</p>
                      <p className="text-2xl font-bold">{data?.performance.totalRequests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tasa de Error</p>
                      <p className="text-2xl font-bold">{data?.performance.errorRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Uptime</p>
                      <p className="text-2xl font-bold">{data?.performance.uptime.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Negocio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Total de Usuarios</p>
                      <p className="text-2xl font-bold">{data?.business.totalUsers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tiendas Activas</p>
                      <p className="text-2xl font-bold">{data?.business.activeStores}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total de Órdenes</p>
                      <p className="text-2xl font-bold">{data?.business.totalOrders.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ingresos</p>
                      <p className="text-2xl font-bold">${data?.business.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Errores Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{data?.errors.critical}</p>
                      <p className="text-sm text-muted-foreground">Críticos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{data?.errors.warning}</p>
                      <p className="text-sm text-muted-foreground">Advertencias</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{data?.errors.info}</p>
                      <p className="text-sm text-muted-foreground">Información</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {data?.errors.recent.map((error) => (
                      <div key={error.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={
                            error.level === 'critical' ? 'destructive' :
                            error.level === 'warning' ? 'secondary' : 'default'
                          }>
                            {error.level}
                          </Badge>
                          <div>
                            <p className="font-medium">{error.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(error.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {error.user && <p>Usuario: {error.user}</p>}
                          {error.store && <p>Tienda: {error.store}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Rendimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data?.metrics.performance.slice(0, 10).map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(metric.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline">{metric.duration}ms</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Negocio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data?.metrics.business.slice(0, 10).map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{metric.event}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(metric.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {metric.userId && <p>Usuario: {metric.userId}</p>}
                          {metric.storeSlug && <p>Tienda: {metric.storeSlug}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
