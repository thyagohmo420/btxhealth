"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Video,
  FileText,
  GraduationCap,
  Brain,
  Trophy,
  Users,
  BarChart,
  Play,
  Plus,
  Search,
  Filter,
  Share2,
  Star,
  Clock,
  Eye
} from 'lucide-react'
import PrivateRoute from '@/components/PrivateRoute'

// Dados simulados
const initialContent = [
  {
    id: 1,
    title: 'Protocolo de Higienização das Mãos',
    type: 'video',
    category: 'Protocolos',
    duration: '10 min',
    views: 150,
    rating: 4.8,
    completions: 120,
    createdAt: '2024-03-10T10:00:00'
  },
  {
    id: 2,
    title: 'Administração Segura de Medicamentos',
    type: 'course',
    category: 'Medicação',
    duration: '2h',
    views: 80,
    rating: 4.5,
    completions: 45,
    createdAt: '2024-03-12T14:30:00'
  },
  {
    id: 3,
    title: 'Guia de Prevenção de Quedas',
    type: 'text',
    category: 'Segurança',
    duration: '15 min',
    views: 200,
    rating: 4.6,
    completions: 180,
    createdAt: '2024-03-14T09:15:00'
  }
]

const initialMetrics = {
  totalViews: 2500,
  activeUsers: 180,
  completionRate: 75,
  averageRating: 4.6
}

const initialGameMetrics = {
  totalPoints: 12500,
  leaderboard: [
    { id: 1, name: 'João Silva', points: 850, badges: 12 },
    { id: 2, name: 'Maria Santos', points: 720, badges: 10 },
    { id: 3, name: 'Pedro Oliveira', points: 650, badges: 8 }
  ],
  recentBadges: [
    { id: 1, name: 'Mestre em Protocolos', description: 'Completou todos os cursos de protocolos' },
    { id: 2, name: 'Especialista em Segurança', description: 'Pontuação máxima nos testes de segurança' }
  ]
}

export default function Education() {
  const [content, setContent] = useState(initialContent)
  const [metrics, setMetrics] = useState(initialMetrics)
  const [gameMetrics, setGameMetrics] = useState(initialGameMetrics)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isNewContentOpen, setIsNewContentOpen] = useState(false)
  const [isEngagementOpen, setIsEngagementOpen] = useState(false)

  // Função para filtrar conteúdo
  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategory || item.category === selectedCategory)
  )

  // Função para criar novo conteúdo
  const handleNewContent = () => {
    setIsNewContentOpen(true)
  }

  // Função para ver relatório de engajamento
  const handleViewEngagement = () => {
    setIsEngagementOpen(true)
  }

  return (
    <PrivateRoute allowedRoles={['medico', 'enfermeiro', 'administrador']}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Educação</h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={handleNewContent}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Conteúdo
            </Button>
            <Button variant="outline" onClick={handleViewEngagement}>
              <BarChart className="w-4 h-4 mr-2" />
              Engajamento
            </Button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalViews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.activeUsers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.completionRate}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.averageRating}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Gamificação */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Gamificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Ranking</h3>
                <div className="space-y-4">
                  {gameMetrics.leaderboard.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full ${
                          index === 0 ? 'bg-yellow-400 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          'bg-orange-400 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <span>{user.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{user.points} pontos</span>
                        <span className="text-sm text-purple-600">{user.badges} medalhas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Conquistas Recentes</h3>
                <div className="space-y-4">
                  {gameMetrics.recentBadges.map((badge) => (
                    <div key={badge.id} className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-purple-700">{badge.name}</span>
                      </div>
                      <p className="text-sm text-purple-600">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Barra de Busca e Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conteúdo..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas as Categorias</option>
            <option value="Protocolos">Protocolos</option>
            <option value="Medicação">Medicação</option>
            <option value="Segurança">Segurança</option>
          </select>
        </div>

        {/* Lista de Conteúdo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {item.type === 'video' && <Video className="w-5 h-5 text-blue-500" />}
                    {item.type === 'text' && <FileText className="w-5 h-5 text-green-500" />}
                    {item.type === 'course' && <GraduationCap className="w-5 h-5 text-purple-500" />}
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <span className="text-sm text-gray-500">{item.category}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {item.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {item.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {item.rating}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button>
                    <Play className="w-4 h-4 mr-2" />
                    {item.type === 'video' ? 'Assistir' : 
                     item.type === 'text' ? 'Ler' : 'Iniciar'}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {item.completions} conclusões
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de Novo Conteúdo */}
        <Dialog open={isNewContentOpen} onOpenChange={setIsNewContentOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Conteúdo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  className="col-span-3"
                  placeholder="Título do conteúdo"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="video">Vídeo</option>
                  <option value="text">Texto</option>
                  <option value="course">Curso</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="Protocolos">Protocolos</option>
                  <option value="Medicação">Medicação</option>
                  <option value="Segurança">Segurança</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  className="col-span-3 min-h-[100px] flex w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder="Descrição do conteúdo"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="media">Mídia</Label>
                <Input
                  id="media"
                  type="file"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewContentOpen(false)}>
                Cancelar
              </Button>
              <Button>Publicar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Engajamento */}
        <Dialog open={isEngagementOpen} onOpenChange={setIsEngagementOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Relatório de Engajamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-700">Insights da IA</div>
                    <div className="text-sm text-blue-600 mt-1">
                      Baseado na análise dos dados de engajamento:
                      <ul className="mt-2 list-disc list-inside">
                        <li>Vídeos curtos (5-10 min) têm maior taxa de conclusão</li>
                        <li>Conteúdo sobre protocolos é mais acessado no início do turno</li>
                        <li>Gamificação aumentou engajamento em 45%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Conteúdo Mais Acessado</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Visualizações</TableHead>
                      <TableHead>Taxa de Conclusão</TableHead>
                      <TableHead>Avaliação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {content.sort((a, b) => b.views - a.views).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.type === 'video' ? 'bg-blue-100 text-blue-600' :
                            item.type === 'text' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {item.type}
                          </span>
                        </TableCell>
                        <TableCell>{item.views}</TableCell>
                        <TableCell>
                          {Math.round((item.completions / item.views) * 100)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {item.rating}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PrivateRoute>
  )
} 