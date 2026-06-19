import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useForm } from 'react-hook-form';
import { 
  Users, 
  Store, 
  Star, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  X,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

interface UserItem {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
  createdAt: string;
}

interface StoreItem {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  averageRating: number;
  totalRatings: number;
}

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');

  // User management states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [userSortBy, _setUserSortBy] = useState('createdAt');
  const [userSortOrder, _setUserSortOrder] = useState<'asc' | 'desc'>('desc');
  const [userPage, setUserPage] = useState(1);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Store management states
  const [storeSearch, setStoreSearch] = useState('');
  const [storePage, setStorePage] = useState(1);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);

  // Fetch admin dashboard aggregated stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/admin');
      return response.data;
    },
  });

  // Fetch paginated, filtered user records
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', userPage, userSearch, userRoleFilter, userSortBy, userSortOrder],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: {
          page: userPage,
          limit: 6,
          search: userSearch,
          role: userRoleFilter || undefined,
          sortBy: userSortBy,
          sortOrder: userSortOrder,
        },
      });
      return response.data;
    },
  });

  // Fetch paginated store records
  const { data: storesData, isLoading: storesLoading } = useQuery({
    queryKey: ['adminStores', storePage, storeSearch],
    queryFn: async () => {
      const response = await api.get('/stores', {
        params: {
          page: storePage,
          limit: 6,
          search: storeSearch,
        },
      });
      return response.data;
    },
  });

  // Fetch all potential store owners for store creation selector
  const { data: potentialOwners } = useQuery({
    queryKey: ['potentialOwners'],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: { limit: 100, role: 'STORE_OWNER' },
      });
      return response.data.data as UserItem[];
    },
    enabled: activeTab === 'stores',
  });

  // Forms setup
  const userForm = useForm({
    defaultValues: { name: '', email: '', password: '', address: '', role: 'USER' }
  });
  const storeForm = useForm({
    defaultValues: { name: '', email: '', address: '', ownerId: '' }
  });

  // Reset forms on edit hook trigger
  useEffect(() => {
    if (editingUser) {
      userForm.reset({
        name: editingUser.name,
        email: editingUser.email,
        password: '',
        address: editingUser.address,
        role: editingUser.role,
      });
    } else {
      userForm.reset({ name: '', email: '', password: '', address: '', role: 'USER' });
    }
  }, [editingUser, userModalOpen]);

  useEffect(() => {
    if (editingStore) {
      storeForm.reset({
        name: editingStore.name,
        email: editingStore.email,
        address: editingStore.address,
        ownerId: editingStore.ownerId,
      });
    } else {
      storeForm.reset({ name: '', email: '', address: '', ownerId: '' });
    }
  }, [editingStore, storeModalOpen]);

  // Mutations for Users CRUD
  const saveUserMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingUser) {
        if (!data.password) delete data.password;
        await api.put(`/users/${editingUser.id}`, data);
      } else {
        await api.post('/users', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast(editingUser ? 'User updated successfully' : 'User created successfully', 'success');
      setUserModalOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error saving user details', 'error');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast('User deleted successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete user', 'error');
    },
  });

  // Mutations for Stores CRUD
  const saveStoreMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingStore) {
        await api.put(`/stores/${editingStore.id}`, data);
      } else {
        await api.post('/stores', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast(editingStore ? 'Store updated successfully' : 'Store created successfully', 'success');
      setStoreModalOpen(false);
      setEditingStore(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error saving store details', 'error');
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/stores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast('Store deleted successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete store', 'error');
    },
  });

  const onUserSubmit = (data: any) => {
    saveUserMutation.mutate(data);
  };

  const onStoreSubmit = (data: any) => {
    saveStoreMutation.mutate(data);
  };

  // Recharts custom coloring setup
  const COLORS = ['#FF6B6B', '#FFD93D', '#C4B5FD', '#2563eb', '#10b981'];

  return (
    <div className="space-y-10 text-black">
      {/* Title */}
      <div>
        <h2 className="text-4xl font-black uppercase tracking-tight text-black m-0">Admin Center</h2>
        <p className="text-sm font-bold text-black/70 mt-1 uppercase tracking-wider">
          Audit, register, and supervise system assets and user accounts
        </p>
      </div>

      {/* KPI Cards section */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 border-4 border-black bg-white shadow-neo-sm shimmer-wrapper"></div>
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border-4 border-black bg-white shadow-neo-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-black font-black uppercase tracking-widest block">Total Users</span>
                <h3 className="text-4xl font-black text-black mt-1 mb-0">{stats.totalUsers}</h3>
              </div>
              <div className="p-4 border-4 border-black bg-neo-secondary text-black shadow-neo-sm">
                <Users className="h-6 w-6 stroke-[2.5px]" />
              </div>
            </div>
            <div className="p-6 border-4 border-black bg-white shadow-neo-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-black font-black uppercase tracking-widest block">Active Stores</span>
                <h3 className="text-4xl font-black text-black mt-1 mb-0">{stats.totalStores}</h3>
              </div>
              <div className="p-4 border-4 border-black bg-neo-muted text-black shadow-neo-sm">
                <Store className="h-6 w-6 stroke-[2.5px]" />
              </div>
            </div>
            <div className="p-6 border-4 border-black bg-white shadow-neo-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-black font-black uppercase tracking-widest block">Feedback Ratings</span>
                <h3 className="text-4xl font-black text-black mt-1 mb-0">{stats.totalRatings}</h3>
              </div>
              <div className="p-4 border-4 border-black bg-neo-accent text-black shadow-neo-sm">
                <Star className="h-6 w-6 stroke-[2.5px] fill-current text-black" />
              </div>
            </div>
          </div>
        )
      )}

      {/* Analytics Charts section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ratings distribution */}
          <div className="p-6 border-4 border-black bg-white shadow-neo-md">
            <h4 className="text-base font-black uppercase tracking-wider text-black mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 text-black fill-neo-secondary stroke-[2.5px]" /> Ratings Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.ratingBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" opacity={0.2} />
                  <XAxis dataKey="rating" stroke="#000" tickFormatter={(v) => `${v} ★`} tick={{ fontWeight: 'bold' }} />
                  <YAxis stroke="#000" allowDecimals={false} tick={{ fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#000', borderWidth: '4px', borderRadius: '0px' }}
                    labelStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                    labelFormatter={(label) => `${label} Star Ratings`}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 0, 0, 0]}>
                    {stats.charts.ratingBreakdown.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Roles distribution */}
          <div className="p-6 border-4 border-black bg-white shadow-neo-md">
            <h4 className="text-base font-black uppercase tracking-wider text-black mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-black stroke-[2.5px]" /> User Accounts Segmentation
            </h4>
            <div className="h-64 flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.charts.rolesBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="role"
                    >
                      {stats.charts.rolesBreakdown.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#000', borderWidth: '4px', borderRadius: '0px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-2 px-6">
                {stats.charts.rolesBreakdown.map((item: any, index: number) => (
                  <div key={item.role} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="h-4 w-4 border-2 border-black" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-black uppercase tracking-wider text-xs font-black">{item.role}</span>
                    </div>
                    <span className="text-black font-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex gap-4 border-b-4 border-black pb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 border-4 border-black text-sm font-black uppercase tracking-wider transition-all duration-100 shadow-neo-sm cursor-pointer ${
            activeTab === 'users' ? 'bg-neo-secondary text-black translate-y-[2px]' : 'bg-white text-black hover:bg-neo-secondary hover:shadow-neo-md active:translate-y-[2px] active:shadow-none'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 border-4 border-black text-sm font-black uppercase tracking-wider transition-all duration-100 shadow-neo-sm cursor-pointer ${
            activeTab === 'stores' ? 'bg-neo-secondary text-black translate-y-[2px]' : 'bg-white text-black hover:bg-neo-secondary hover:shadow-neo-md active:translate-y-[2px] active:shadow-none'
          }`}
        >
          Store Management
        </button>
      </div>

      {/* TAB 1: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-xl">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black stroke-[2.5px]" />
                <input
                  type="text"
                  placeholder="Search user by name, email, address..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-2.5 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm"
                />
              </div>

              {/* Role filter */}
              <div className="relative min-w-[150px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black stroke-[2.5px]" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-2.5 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm appearance-none cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                  <option value="STORE_OWNER">STORE OWNER</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingUser(null);
                setUserModalOpen(true);
              }}
              className="py-2.5 px-4 border-4 border-black bg-neo-secondary hover:bg-neo-accent text-black text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-neo-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Plus className="h-4 w-4 stroke-[3px]" /> Add User
            </button>
          </div>

          {/* User Table container */}
          {usersLoading ? (
            <div className="h-64 border-4 border-black bg-white shadow-neo-md shimmer-wrapper"></div>
          ) : (
            usersData && (
              <div className="border-4 border-black bg-white shadow-neo-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-black">
                    <thead className="bg-neo-muted/30 border-b-4 border-black text-xs font-black uppercase tracking-wider text-black">
                      <tr>
                        <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Name</th>
                        <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Email</th>
                        <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Address</th>
                        <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Role</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-black">
                      {usersData.data.map((usr: UserItem) => (
                        <tr key={usr.id} className="hover:bg-neo-secondary/10 transition-colors">
                          <td className="px-6 py-4 font-black text-black border-r-4 border-black last:border-r-0">{usr.name}</td>
                          <td className="px-6 py-4 font-bold border-r-4 border-black last:border-r-0">{usr.email}</td>
                          <td className="px-6 py-4 max-w-xs truncate font-bold border-r-4 border-black last:border-r-0">{usr.address}</td>
                          <td className="px-6 py-4 border-r-4 border-black last:border-r-0">
                            <span className={`text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider ${
                              usr.role === 'ADMIN' ? 'bg-neo-accent text-black' :
                              usr.role === 'STORE_OWNER' ? 'bg-neo-secondary text-black' :
                              'bg-neo-muted text-black'
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingUser(usr);
                                  setUserModalOpen(true);
                                }}
                                className="p-1.5 border-2 border-black bg-white hover:bg-neo-secondary text-black hover:shadow-neo-sm active:translate-y-0.5 transition-all"
                              >
                                <Pencil className="h-4 w-4 stroke-[2.5px]" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete user ${usr.name}?`)) {
                                    deleteUserMutation.mutate(usr.id);
                                  }
                                }}
                                className="p-1.5 border-2 border-black bg-white hover:bg-neo-accent text-black hover:shadow-neo-sm active:translate-y-0.5 transition-all"
                              >
                                <Trash2 className="h-4 w-4 stroke-[2.5px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="px-6 py-4 flex items-center justify-between border-t-4 border-black bg-neo-muted/10">
                  <span className="text-xs font-black text-black uppercase tracking-wider">
                    Showing page {usersData.meta.page} of {usersData.meta.totalPages} ({usersData.meta.total} users)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => p - 1)}
                      className="p-1.5 border-2 border-black bg-white hover:bg-neo-secondary text-black disabled:opacity-40 hover:shadow-neo-sm transition-all cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4 stroke-[3px]" />
                    </button>
                    <button
                      disabled={userPage >= usersData.meta.totalPages}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="p-1.5 border-2 border-black bg-white hover:bg-neo-secondary text-black disabled:opacity-40 hover:shadow-neo-sm transition-all cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4 stroke-[3px]" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 2: Store Management */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black stroke-[2.5px]" />
              <input
                type="text"
                placeholder="Search stores by name, email, address..."
                value={storeSearch}
                onChange={(e) => {
                  setStoreSearch(e.target.value);
                  setStorePage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm"
              />
            </div>

            <button
              onClick={() => {
                setEditingStore(null);
                setStoreModalOpen(true);
              }}
              className="py-2.5 px-4 border-4 border-black bg-neo-secondary hover:bg-neo-accent text-black text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-neo-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Plus className="h-4 w-4 stroke-[3px]" /> Add Store
            </button>
          </div>

          {/* Stores Table container */}
          {storesLoading ? (
            <div className="h-64 border-4 border-black bg-white shadow-neo-md shimmer-wrapper"></div>
          ) : (
            storesData && (
              <div className="border-4 border-black bg-white shadow-neo-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-black">
                    <thead className="bg-neo-muted/30 border-b-4 border-black text-xs font-black uppercase tracking-wider text-black">
                      <tr>
                        <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Store Name</th>
                        <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Contact Email</th>
                        <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Store Address</th>
                        <th className="px-6 py-4 border-r-4 border-black last:border-r-0 text-center">Avg Rating</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-black">
                      {storesData.data.map((str: StoreItem) => (
                        <tr key={str.id} className="hover:bg-neo-secondary/10 transition-colors">
                          <td className="px-6 py-4 font-black text-black border-r-4 border-black last:border-r-0">{str.name}</td>
                          <td className="px-6 py-4 font-bold border-r-4 border-black last:border-r-0">{str.email}</td>
                          <td className="px-6 py-4 max-w-xs truncate font-bold border-r-4 border-black last:border-r-0">{str.address}</td>
                          <td className="px-6 py-4 border-r-4 border-black last:border-r-0 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Star className="h-4 w-4 text-black fill-neo-secondary stroke-[2px]" />
                              <span className="font-black text-black">{str.averageRating}</span>
                              <span className="text-xs font-bold text-black/60">({str.totalRatings})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingStore(str);
                                  setStoreModalOpen(true);
                                }}
                                className="p-1.5 border-2 border-black bg-white hover:bg-neo-secondary text-black hover:shadow-neo-sm active:translate-y-0.5 transition-all"
                              >
                                <Pencil className="h-4 w-4 stroke-[2.5px]" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete store ${str.name}?`)) {
                                    deleteStoreMutation.mutate(str.id);
                                  }
                                }}
                                className="p-1.5 border-2 border-black bg-white hover:bg-neo-accent text-black hover:shadow-neo-sm active:translate-y-0.5 transition-all"
                              >
                                <Trash2 className="h-4 w-4 stroke-[2.5px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="px-6 py-4 flex items-center justify-between border-t-4 border-black bg-neo-muted/10">
                  <span className="text-xs font-black text-black uppercase tracking-wider">
                    Showing page {storesData.meta.page} of {storesData.meta.totalPages} ({storesData.meta.total} stores)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={storePage <= 1}
                      onClick={() => setStorePage((p) => p - 1)}
                      className="p-1.5 border-2 border-black bg-white hover:bg-neo-secondary text-black disabled:opacity-40 hover:shadow-neo-sm transition-all cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4 stroke-[3px]" />
                    </button>
                    <button
                      disabled={storePage >= storesData.meta.totalPages}
                      onClick={() => setStorePage((p) => p + 1)}
                      className="p-1.5 border-2 border-black bg-white hover:bg-neo-secondary text-black disabled:opacity-40 hover:shadow-neo-sm transition-all cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4 stroke-[3px]" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* USER CRUD CREATION/EDIT MODAL */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border-8 border-black bg-white shadow-neo-xl space-y-4 animate-bounce-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-black uppercase tracking-wider m-0">
                {editingUser ? 'Edit User Details' : 'Register New User'}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="p-1.5 border-2 border-black bg-white hover:bg-neo-accent text-black hover:shadow-neo-sm transition-all"
              >
                <X className="h-4 w-4 stroke-[3px]" />
              </button>
            </div>

            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm"
                  {...userForm.register('name', { required: 'Name is required', minLength: 2, maxLength: 60 })}
                />
                {userForm.formState.errors.name && <span className="text-xs text-white bg-black font-black uppercase tracking-wider px-2 py-1 inline-block mt-1">Name is required (2-60 chars)</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm"
                  {...userForm.register('email', { required: 'Email is required' })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">
                  Password {editingUser && <span className="text-[10px] text-black/60 font-bold">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  placeholder="8-16 chars, 1 uppercase, 1 special"
                  className="w-full px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm"
                  {...userForm.register('password', {
                    required: !editingUser ? 'Password is required' : false,
                    validate: (val) => {
                      if (!val && editingUser) return true;
                      if (!val) return 'Password is required';
                      if (val.length < 8 || val.length > 16) return 'Password must be 8-16 characters';
                      if (!/(?=.*[A-Z])/.test(val)) return 'Need at least 1 uppercase letter';
                      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/.test(val)) return 'Need at least 1 special character';
                      return true;
                    }
                  })}
                />
                {userForm.formState.errors.password && <span className="text-xs text-white bg-black font-black uppercase tracking-wider px-2 py-1 inline-block mt-1">{userForm.formState.errors.password.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">Location Address</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm resize-none"
                  {...userForm.register('address', { required: 'Address is required', maxLength: 400 })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">User Role</label>
                <select
                  className="w-full px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm cursor-pointer"
                  {...userForm.register('role', { required: true })}
                >
                  <option value="USER">USER</option>
                  <option value="STORE_OWNER">STORE OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saveUserMutation.isPending}
                className="w-full py-3 border-4 border-black bg-neo-secondary hover:bg-neo-accent disabled:bg-neo-secondary/50 text-black font-black uppercase tracking-wider text-sm transition-all duration-100 shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {saveUserMutation.isPending && <Loader2 className="h-4 w-4 stroke-[3px] animate-spin" />}
                {editingUser ? 'Update Account' : 'Register User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STORE CRUD CREATION/EDIT MODAL */}
      {storeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border-8 border-black bg-white shadow-neo-xl space-y-4 animate-bounce-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-black uppercase tracking-wider m-0">
                {editingStore ? 'Edit Store Details' : 'Register New Store'}
              </h3>
              <button
                onClick={() => setStoreModalOpen(false)}
                className="p-1.5 border-2 border-black bg-white hover:bg-neo-accent text-black hover:shadow-neo-sm transition-all"
              >
                <X className="h-4 w-4 stroke-[3px]" />
              </button>
            </div>

            <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">Store Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm"
                  {...storeForm.register('name', { required: 'Store name is required' })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">Contact Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm"
                  {...storeForm.register('email', { required: 'Email is required' })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">Location Address</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm resize-none"
                  {...storeForm.register('address', { required: 'Address is required' })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">Store Owner</label>
                <select
                  className="w-full px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm cursor-pointer"
                  {...storeForm.register('ownerId', { required: 'Store owner is required' })}
                >
                  <option value="">Select owner account...</option>
                  {potentialOwners?.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saveStoreMutation.isPending}
                className="w-full py-3 border-4 border-black bg-neo-secondary hover:bg-neo-accent disabled:bg-neo-secondary/50 text-black font-black uppercase tracking-wider text-sm transition-all duration-100 shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {saveStoreMutation.isPending && <Loader2 className="h-4 w-4 stroke-[3px] animate-spin" />}
                {editingStore ? 'Update Store' : 'Create Store'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
