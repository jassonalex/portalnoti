import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  PlusCircle, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Camera, 
  Paperclip, 
  Send,
  MoreVertical,
  ThumbsUp,
  X,
  Menu,
  Home,
  User,
  Activity,
  BarChart3,
  Calendar
} from 'lucide-react';

// --- Types & Interfaces ---

type Role = 'resident' | 'admin';
type Status = 'Pendente' | 'Em análise' | 'Em andamento' | 'Resolvido';
type Priority = 'Baixa' | 'Média' | 'Alta';
type Category = 'Notificação' | 'Reclamação' | 'Sugestão' | 'Elogio';

interface User {
  id: string;
  name: string;
  role: Role;
  unit?: string; // Block/Apt for residents
  email: string;
  avatar?: string;
}

interface ActionLog {
  id: string;
  description: string;
  date: string;
  user: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userUnit: string;
  category: Category;
  title: string;
  description: string;
  date: string;
  status: Status;
  priority: Priority;
  attachments: string[]; // URLs or placeholders
  response?: string;
  responseDate?: string;
  rating?: number;
  actions: ActionLog[];
}

// --- Mock Data ---

const MOCK_RESIDENT: User = {
  id: 'r1',
  name: 'Ana Silva',
  role: 'resident',
  unit: 'Bl-A Apt-101',
  email: 'ana@example.com',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d'
};

const MOCK_ADMIN: User = {
  id: 'a1',
  name: 'Carlos Síndico',
  role: 'admin',
  email: 'sindico@condo.com',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    userId: 'r1',
    userName: 'Ana Silva',
    userUnit: 'Bl-A Apt-101',
    category: 'Reclamação',
    title: 'Vazamento na garagem',
    description: 'Há uma goteira persistente em cima da minha vaga de garagem (45).',
    date: '2023-10-25T10:00:00',
    status: 'Em andamento',
    priority: 'Alta',
    attachments: [],
    actions: [
      { id: 'ac1', description: 'Vistoria realizada pelo zelador', date: '2023-10-25T14:00:00', user: 'Zelador' },
      { id: 'ac2', description: 'Orçamento solicitado à empresa de encanamento', date: '2023-10-26T09:00:00', user: 'Síndico' }
    ]
  },
  {
    id: 'm2',
    userId: 'r2',
    userName: 'João Souza',
    userUnit: 'Bl-B Apt-202',
    category: 'Sugestão',
    title: 'Lixeiras de reciclagem',
    description: 'Poderíamos colocar lixeiras coloridas perto da churrasqueira.',
    date: '2023-10-24T16:30:00',
    status: 'Pendente',
    priority: 'Baixa',
    attachments: [],
    actions: []
  },
  {
    id: 'm3',
    userId: 'r1',
    userName: 'Ana Silva',
    userUnit: 'Bl-A Apt-101',
    category: 'Elogio',
    title: 'Limpeza do hall',
    description: 'Gostaria de elogiar a equipe de limpeza, o hall está impecável.',
    date: '2023-10-20T08:00:00',
    status: 'Resolvido',
    priority: 'Baixa',
    attachments: [],
    response: 'Muito obrigado, Ana! Repassarei o elogio à equipe.',
    responseDate: '2023-10-20T10:00:00',
    rating: 5,
    actions: []
  },
  {
    id: 'm4',
    userId: 'r3',
    userName: 'Mariana Costa',
    userUnit: 'Bl-A Apt-305',
    category: 'Notificação',
    title: 'Barulho após horário',
    description: 'O apartamento 306 estava com som alto as 23h ontem.',
    date: '2023-10-26T23:15:00',
    status: 'Em análise',
    priority: 'Média',
    attachments: [],
    actions: []
  }
];

// --- Helpers ---

const getStatusColor = (status: Status) => {
  switch (status) {
    case 'Pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Em análise': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Em andamento': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Resolvido': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'Alta': return 'text-red-600 font-semibold';
    case 'Média': return 'text-orange-500 font-medium';
    case 'Baixa': return 'text-green-600 font-medium';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// --- Components ---

function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
          <Home className="h-8 w-8 text-white" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
          Portal do Condomínio
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Gestão inteligente e comunicação eficiente.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-brand-600 hover:text-brand-500">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                Entrar
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Acesso de Demonstração
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  onClick={() => onLogin('resident')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                >
                  <User className="w-5 h-5 mr-2" />
                  Morador
                </button>
              </div>

              <div>
                <button
                  onClick={() => onLogin('admin')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Síndico
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard'); // dashboard, messages, new-message, reports, details
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // New Message Form State
  const [newMsgCategory, setNewMsgCategory] = useState<Category>('Reclamação');
  const [newMsgTitle, setNewMsgTitle] = useState('');
  const [newMsgDesc, setNewMsgDesc] = useState('');
  const [newMsgPriority, setNewMsgPriority] = useState<Priority>('Baixa');

  // Response / Action State
  const [actionDesc, setActionDesc] = useState('');
  const [responseDesc, setResponseDesc] = useState('');

  const handleLogin = (role: Role) => {
    setUser(role === 'resident' ? MOCK_RESIDENT : MOCK_ADMIN);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleNewMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newMessage: Message = {
      id: `m${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userUnit: user.unit || '',
      category: newMsgCategory,
      title: newMsgTitle,
      description: newMsgDesc,
      date: new Date().toISOString(),
      status: 'Pendente',
      priority: newMsgPriority,
      attachments: [],
      actions: []
    };
    setMessages([newMessage, ...messages]);
    setView('messages');
    // Reset form
    setNewMsgTitle('');
    setNewMsgDesc('');
  };

  const handleAddAction = (msgId: string) => {
    if (!actionDesc.trim()) return;
    setMessages(msgs => msgs.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          actions: [...m.actions, {
            id: `act${Date.now()}`,
            description: actionDesc,
            date: new Date().toISOString(),
            user: user?.name || 'Admin'
          }]
        };
      }
      return m;
    }));
    setActionDesc('');
  };

  const handleUpdateStatus = (msgId: string, newStatus: Status) => {
    setMessages(msgs => msgs.map(m => m.id === msgId ? { ...m, status: newStatus } : m));
  };

  const handleSendResponse = (msgId: string) => {
    if (!responseDesc.trim()) return;
    setMessages(msgs => msgs.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          response: responseDesc,
          responseDate: new Date().toISOString(),
          status: 'Resolvido' // Auto resolve or keep optional? Let's auto resolve for flow.
        };
      }
      return m;
    }));
    setResponseDesc('');
  };

  const handleRate = (msgId: string, rating: number) => {
    setMessages(msgs => msgs.map(m => m.id === msgId ? { ...m, rating } : m));
  };

  // --- Filtered Data ---
  const filteredMessages = useMemo(() => {
    let filtered = messages;
    if (user?.role === 'resident') {
      filtered = filtered.filter(m => m.userId === user.id);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(m => m.category === filterCategory);
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [messages, user, filterStatus, filterCategory]);

  const stats = useMemo(() => {
    return {
      pending: messages.filter(m => m.status === 'Pendente').length,
      resolved: messages.filter(m => m.status === 'Resolvido').length,
      total: messages.length,
      byCategory: {
        'Reclamação': messages.filter(m => m.category === 'Reclamação').length,
        'Sugestão': messages.filter(m => m.category === 'Sugestão').length,
        'Elogio': messages.filter(m => m.category === 'Elogio').length,
        'Notificação': messages.filter(m => m.category === 'Notificação').length,
      }
    };
  }, [messages]);

  // --- Views ---

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderDashboard = () => (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-500">Bem-vindo ao portal do condomínio.</p>
        </div>
        {user.role === 'resident' && (
          <button 
            onClick={() => setView('new-message')}
            className="flex items-center justify-center px-4 py-2 bg-brand-600 text-white rounded-lg shadow-md hover:bg-brand-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nova Solicitação
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2 text-yellow-600">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Pendentes</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.resolved}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Resolvidas</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Total</span>
        </div>
        {/* Priority Highlight */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {messages.filter(m => m.priority === 'Alta' && m.status !== 'Resolvido').length}
          </span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Prioridade Alta</span>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Atividades Recentes</h3>
          <button onClick={() => setView('messages')} className="text-sm text-brand-600 hover:text-brand-700">Ver todas</button>
        </div>
        <div className="divide-y divide-gray-50">
          {filteredMessages.slice(0, 3).map(msg => (
            <div key={msg.id} onClick={() => { setSelectedMessageId(msg.id); setView('details'); }} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(msg.status)} border`}>
                  {msg.status}
                </span>
                <span className="text-xs text-gray-400">{formatDate(msg.date)}</span>
              </div>
              <h4 className="font-medium text-gray-900">{msg.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-1">{msg.description}</p>
              {user.role === 'admin' && (
                <div className="mt-2 text-xs text-gray-400 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {msg.userName} - {msg.userUnit}
                </div>
              )}
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className="p-8 text-center text-gray-500">Nenhuma atividade recente.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNewMessage = () => (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nova Solicitação</h2>
      <form onSubmit={handleNewMessage} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['Notificação', 'Reclamação', 'Sugestão', 'Elogio'] as Category[]).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setNewMsgCategory(cat)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  newMsgCategory === cat 
                    ? 'bg-brand-50 border-brand-200 text-brand-700 ring-1 ring-brand-500' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            required
            value={newMsgTitle}
            onChange={(e) => setNewMsgTitle(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
            placeholder="Resumo do assunto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
          <select 
            value={newMsgPriority} 
            onChange={(e) => setNewMsgPriority(e.target.value as Priority)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
          <textarea
            required
            rows={4}
            value={newMsgDesc}
            onChange={(e) => setNewMsgDesc(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
            placeholder="Descreva o problema ou sugestão com detalhes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Evidências (Fotos/Vídeos)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Toque para adicionar fotos ou vídeos</span>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => setView('dashboard')} className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-3 bg-brand-600 rounded-lg text-white font-medium hover:bg-brand-700 shadow-sm">
            Enviar Mensagem
          </button>
        </div>
      </form>
    </div>
  );

  const renderMessageList = () => (
    <div className="pb-20 md:pb-0 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {user.role === 'admin' ? 'Central de Mensagens' : 'Minhas Solicitações'}
        </h2>
        {user.role === 'resident' && (
           <button 
             onClick={() => setView('new-message')}
             className="bg-brand-600 text-white p-2 rounded-lg shadow hover:bg-brand-700 md:hidden"
           >
             <PlusCircle className="w-6 h-6" />
           </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-gray-500 mr-2" />
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="text-sm border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="all">Todas Categorias</option>
          <option value="Reclamação">Reclamação</option>
          <option value="Sugestão">Sugestão</option>
          <option value="Notificação">Notificação</option>
          <option value="Elogio">Elogio</option>
        </select>

        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="all">Todos Status</option>
          <option value="Pendente">Pendente</option>
          <option value="Em análise">Em análise</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Resolvido">Resolvido</option>
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
        {filteredMessages.map(msg => (
          <div 
            key={msg.id} 
            onClick={() => { setSelectedMessageId(msg.id); setView('details'); }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(msg.status)} border`}>
                    {msg.status}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(msg.date)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{msg.title}</h3>
                {user.role === 'admin' && (
                  <p className="text-xs text-brand-600 font-medium mb-1">
                    {msg.userName} • {msg.userUnit}
                  </p>
                )}
                <p className="text-sm text-gray-600 line-clamp-2">{msg.description}</p>
              </div>
              <div className="ml-4 flex flex-col items-end gap-2">
                 <span className={`text-xs font-bold ${getPriorityColor(msg.priority)}`}>
                   {msg.priority}
                 </span>
                 <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </div>
          </div>
        ))}
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium">Nenhuma mensagem encontrada</h3>
            <p className="text-gray-500 text-sm">Tente ajustar os filtros.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDetails = () => {
    const msg = messages.find(m => m.id === selectedMessageId);
    if (!msg) return <div>Mensagem não encontrada</div>;

    return (
      <div className="pb-20 md:pb-0 h-full flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={() => setView('messages')} className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ChevronRight className="w-6 h-6 transform rotate-180 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 line-clamp-1 flex-1">Detalhes da Solicitação</h2>
          {user.role === 'admin' && (
             <div className="relative group">
                {/* Status Dropdown Simulator */}
                <select 
                  value={msg.status}
                  onChange={(e) => handleUpdateStatus(msg.id, e.target.value as Status)}
                  className="appearance-none pl-3 pr-8 py-1 rounded-full text-sm font-semibold bg-gray-100 border-gray-200 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em análise">Em análise</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Resolvido">Resolvido</option>
                </select>
             </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar">
          {/* Main Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{msg.category}</span>
                   <h1 className="text-2xl font-bold text-gray-900 mt-1">{msg.title}</h1>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(msg.status)}`}>
                  {msg.status}
                </div>
             </div>
             
             <div className="flex items-center text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium text-gray-900 mr-4">{msg.userName} ({msg.userUnit})</span>
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatDate(msg.date)}</span>
             </div>

             <div className="prose prose-sm max-w-none text-gray-700">
               <p>{msg.description}</p>
             </div>

             {/* Priority Indicator */}
             <div className="mt-6 flex items-center">
               <span className="text-sm text-gray-500 mr-2">Prioridade:</span>
               <span className={`text-sm font-bold ${getPriorityColor(msg.priority)}`}>{msg.priority}</span>
             </div>
          </div>

          {/* Action History / Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-brand-500" />
              Histórico de Ações
            </h3>
            <div className="space-y-6">
              {/* Original Request Node */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                   <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center z-10">
                      <FileText className="w-4 h-4 text-brand-600" />
                   </div>
                   <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-gray-900">Solicitação aberta</p>
                  <p className="text-xs text-gray-500">{formatDate(msg.date)}</p>
                </div>
              </div>

              {/* Dynamic Actions */}
              {msg.actions.map((action, idx) => (
                <div key={action.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                     <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center z-10">
                        <Settings className="w-4 h-4 text-orange-600" />
                     </div>
                     {(idx < msg.actions.length - 1 || msg.response) && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-gray-800">{action.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{action.user}</span>
                       <span className="text-xs text-gray-400">{formatDate(action.date)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Resolution/Response */}
              {msg.response && (
                <div className="flex gap-4">
                   <div className="flex flex-col items-center">
                     <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                     </div>
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium text-green-800 bg-green-50 p-3 rounded-lg border border-green-100 mb-1">
                      {msg.response}
                    </p>
                    <span className="text-xs text-gray-400">{msg.responseDate && formatDate(msg.responseDate)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Add Action */}
            {user.role === 'admin' && msg.status !== 'Resolvido' && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Adicionar nova etapa</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={actionDesc}
                    onChange={(e) => setActionDesc(e.target.value)}
                    placeholder="Ex: Agendado visita técnica..."
                    className="flex-1 text-sm rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500"
                  />
                  <button 
                    onClick={() => handleAddAction(msg.id)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                  >
                    Registrar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Box (Admin Only) */}
          {user.role === 'admin' && !msg.response && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Finalizar Solicitação</h3>
              <textarea
                value={responseDesc}
                onChange={(e) => setResponseDesc(e.target.value)}
                placeholder="Escreva a resposta final para o morador..."
                className="w-full text-sm rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 mb-3"
                rows={3}
              />
              <button 
                onClick={() => handleSendResponse(msg.id)}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 flex justify-center items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Resposta e Concluir
              </button>
            </div>
          )}

          {/* Rating (Resident Only) */}
          {user.role === 'resident' && msg.status === 'Resolvido' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <h3 className="font-bold text-gray-900 mb-2">Avalie o Atendimento</h3>
              <p className="text-sm text-gray-500 mb-4">Sua opinião é muito importante para melhorarmos.</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    onClick={() => handleRate(msg.id, star)}
                    className={`p-2 rounded-full transition-colors ${
                       (msg.rating || 0) >= star ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </button>
                ))}
              </div>
              {msg.rating && <p className="text-green-600 text-sm font-medium mt-3">Obrigado pela avaliação!</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div className="pb-20 md:pb-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Relatórios Gerenciais</h2>
      
      <div className="grid gap-6">
        {/* Summary Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold mb-4 text-gray-800">Visão Geral por Categoria</h3>
           <div className="space-y-3">
             {Object.entries(stats.byCategory).map(([cat, count]) => (
               <div key={cat}>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-gray-600">{cat}</span>
                   <span className="font-medium text-gray-900">{count as number}</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2">
                   <div 
                     className="bg-brand-500 h-2 rounded-full" 
                     style={{ width: `${stats.total ? ((count as number) / stats.total) * 100 : 0}%` }}
                   ></div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* SLA/Time Stats (Mocked visuals) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Tempo Médio de Resposta</h3>
              <p className="text-3xl font-bold text-gray-900">4h 30m</p>
              <p className="text-green-600 text-sm flex items-center mt-1">
                 <span className="bg-green-100 p-0.5 rounded mr-1">↓ 12%</span>
                 em relação ao mês anterior
              </p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Satisfação Média</h3>
              <div className="flex items-end items-baseline gap-1">
                <p className="text-3xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-500">/ 5.0</p>
              </div>
              <div className="flex text-yellow-400 mt-1">
                 {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
              </div>
           </div>
        </div>
        
        <button className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors flex justify-center items-center">
          <FileText className="w-5 h-5 mr-2" />
          Exportar Relatório PDF Completo
        </button>
      </div>
    </div>
  );

  // --- Layout Render ---

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center justify-center border-b border-gray-100">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white mr-2">
             <Home className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">CondoPortal</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          
          <button 
            onClick={() => setView('messages')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'messages' || view === 'details' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Mensagens
            {stats.pending > 0 && user.role === 'admin' && (
              <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold">{stats.pending}</span>
            )}
          </button>

          {user.role === 'admin' && (
             <button 
                onClick={() => setView('reports')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'reports' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
             >
              <BarChart3 className="w-5 h-5 mr-3" />
              Relatórios
             </button>
          )}

          {user.role === 'resident' && (
             <button 
                onClick={() => setView('new-message')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'new-message' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
             >
              <PlusCircle className="w-5 h-5 mr-3" />
              Nova Solicitação
             </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center mb-4 px-2">
            <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 z-10 sticky top-0">
           <div className="flex items-center">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white mr-2">
                <Home className="w-5 h-5" />
             </div>
             <span className="font-bold text-gray-900">CondoPortal</span>
           </div>
           <button onClick={handleLogout} className="p-2 text-gray-500">
             <LogOut className="w-5 h-5" />
           </button>
        </header>

        {/* Content Scroller */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
          <div className="max-w-4xl mx-auto h-full">
            {view === 'dashboard' && renderDashboard()}
            {view === 'messages' && renderMessageList()}
            {view === 'details' && renderDetails()}
            {view === 'new-message' && renderNewMessage()}
            {view === 'reports' && renderReports()}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full pb-safe flex justify-around items-center h-16 px-2 z-20">
          <button 
            onClick={() => setView('dashboard')} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'dashboard' ? 'text-brand-600' : 'text-gray-400'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          
          <button 
            onClick={() => setView('messages')} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${view === 'messages' || view === 'details' ? 'text-brand-600' : 'text-gray-400'}`}
          >
            <div className="relative">
               <MessageSquare className="w-6 h-6" />
               {stats.pending > 0 && user.role === 'admin' && (
                 <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>
               )}
            </div>
            <span className="text-[10px] font-medium">Mensagens</span>
          </button>

          {user.role === 'resident' ? (
             <button 
               onClick={() => setView('new-message')} 
               className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'new-message' ? 'text-brand-600' : 'text-gray-400'}`}
             >
               <PlusCircle className="w-6 h-6" />
               <span className="text-[10px] font-medium">Novo</span>
             </button>
          ) : (
            <button 
               onClick={() => setView('reports')} 
               className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'reports' ? 'text-brand-600' : 'text-gray-400'}`}
             >
               <BarChart3 className="w-6 h-6" />
               <span className="text-[10px] font-medium">Relatórios</span>
             </button>
          )}

          <div className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400">
             <img src={user.avatar} alt="User" className="w-6 h-6 rounded-full border border-gray-200" />
             <span className="text-[10px] font-medium">Perfil</span>
          </div>
        </nav>
      </main>
    </div>
  );
}