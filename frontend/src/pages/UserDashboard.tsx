import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Star,
  Search,
  MapPin,
  Mail,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  userSubmittedRatingId: string | null;
  userSubmittedRating: number | null;
}

interface StarRatingInputProps {
  value: number;
  onChange: (val: number) => void;
  size?: string;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ value, onChange, size = 'h-7 w-7' }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
        >
          <Star
            className={`${size} stroke-[2.5px] transition-colors ${
              star <= (hovered || value)
                ? 'text-black fill-neo-secondary'
                : 'text-black/30 fill-white'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const StarDisplay: React.FC<{ rating: number; size?: string }> = ({
  rating,
  size = 'h-4 w-4',
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} stroke-[2px] ${
          star <= Math.round(rating)
            ? 'text-black fill-neo-secondary'
            : 'text-black/30 fill-white'
        }`}
      />
    ))}
  </div>
);

export const UserDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [ratingModal, setRatingModal] = useState<{ store: StoreItem; mode: 'add' | 'edit' } | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const { data: storesData, isLoading } = useQuery({
    queryKey: ['userStores', page, search],
    queryFn: async () => {
      const response = await api.get('/stores', {
        params: { page, limit: 9, search },
      });
      return response.data;
    },
  });

  const submitRatingMutation = useMutation({
    mutationFn: async ({
      storeId,
      rating,
      ratingId,
    }: {
      storeId: string;
      rating: number;
      ratingId?: string;
    }) => {
      if (ratingId) {
        await api.put(`/ratings/${ratingId}`, { rating });
      } else {
        await api.post('/ratings', { storeId, rating });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStores'] });
      showToast(
        ratingModal?.mode === 'edit'
          ? 'Rating updated successfully!'
          : 'Rating submitted successfully!',
        'success',
      );
      setRatingModal(null);
      setSelectedRating(0);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to submit rating', 'error');
    },
  });

  const deleteRatingMutation = useMutation({
    mutationFn: async (ratingId: string) => {
      await api.delete(`/ratings/${ratingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStores'] });
      showToast('Rating removed successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to remove rating', 'error');
    },
  });

  const openRatingModal = (store: StoreItem, mode: 'add' | 'edit') => {
    setSelectedRating(mode === 'edit' ? (store.userSubmittedRating ?? 0) : 0);
    setRatingModal({ store, mode });
  };

  const handleSubmitRating = () => {
    if (!selectedRating) {
      showToast('Please select a star rating', 'error');
      return;
    }
    if (!ratingModal) return;
    submitRatingMutation.mutate({
      storeId: ratingModal.store.id,
      rating: selectedRating,
      ratingId:
        ratingModal.mode === 'edit'
          ? (ratingModal.store.userSubmittedRatingId ?? undefined)
          : undefined,
    });
  };

  const ratingLabel: Record<number, string> = {
    0: 'Tap a star to rate',
    1: '😞 Poor',
    2: '😐 Fair',
    3: '🙂 Good',
    4: '😊 Very Good',
    5: '🤩 Excellent!',
  };

  return (
    <div className="space-y-8 text-black">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black uppercase tracking-tight text-black m-0">Explore Stores</h2>
        <p className="text-sm font-bold text-black/70 mt-1 uppercase tracking-wider">
          Discover and rate stores in your community,{' '}
          <span className="text-brand-600 font-black">{user?.name?.split(' ')[0]}</span>
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black stroke-[2.5px]" />
        <input
          type="text"
          placeholder="Search stores by name, location, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-11 pr-4 py-3 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm"
        />
      </div>

      {/* Store Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 border-4 border-black bg-white shadow-neo-sm shimmer-wrapper" />
          ))}
        </div>
      ) : storesData?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-4 border-black bg-white p-16 shadow-neo-sm gap-4 text-black">
          <Store className="h-12 w-12 text-black stroke-[2.5px]" />
          <p className="text-xl font-black uppercase tracking-wider">No stores found</p>
          <p className="text-sm font-bold text-black/60">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storesData?.data?.map((store: StoreItem) => (
            <div
              key={store.id}
              className="group border-4 border-black bg-white p-5 flex flex-col gap-4 shadow-neo-sm hover:shadow-neo-md transition-all duration-100"
            >
              {/* Store header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 border-4 border-black bg-neo-muted flex items-center justify-center text-black font-black text-lg shadow-neo-sm shrink-0">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-black text-sm uppercase tracking-wide leading-tight truncate m-0">
                      {store.name}
                    </h3>
                    <p className="text-[11px] font-bold text-black/60 truncate mt-0.5">{store.email}</p>
                  </div>
                </div>

                {/* Rating badge */}
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 border-2 border-black bg-neo-secondary shadow-neo-sm">
                    <Star className="h-3.5 w-3.5 text-black fill-current stroke-[2px]" />
                    <span className="text-black font-black text-sm">
                      {store.averageRating > 0 ? store.averageRating.toFixed(1) : '—'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/60 mt-1">{store.totalRatings} reviews</span>
                </div>
              </div>

              {/* Store details */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 text-black/80 font-bold uppercase tracking-wide">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-black stroke-[2.5px]" />
                  <p className="text-xs leading-relaxed line-clamp-2">{store.address}</p>
                </div>
                <div className="flex items-center gap-2 text-black/80 font-bold uppercase tracking-wide">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-black stroke-[2.5px]" />
                  <p className="text-xs truncate">{store.email}</p>
                </div>
              </div>

              {/* Star display */}
              <StarDisplay rating={store.averageRating} />

              {/* User rating action */}
              <div className="mt-auto pt-3 border-t-2 border-black">
                {store.userSubmittedRatingId ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-black/60">Your rating:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 stroke-[2px] ${
                              s <= (store.userSubmittedRating ?? 0)
                                ? 'text-black fill-neo-secondary'
                                : 'text-black/30 fill-white'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openRatingModal(store, 'edit')}
                        className="text-[10px] px-2 py-1 border-2 border-black bg-white hover:bg-neo-secondary text-black font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => {
                          if (store.userSubmittedRatingId) {
                            deleteRatingMutation.mutate(store.userSubmittedRatingId);
                          }
                        }}
                        disabled={deleteRatingMutation.isPending}
                        className="text-[10px] px-2 py-1 border-2 border-black bg-white hover:bg-neo-accent text-black font-black uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openRatingModal(store, 'add')}
                    className="w-full flex items-center justify-center gap-2 py-2 border-4 border-black bg-neo-secondary hover:bg-neo-accent text-black text-xs font-black uppercase tracking-wider transition-all hover:shadow-neo-sm active:translate-y-[2px] active:shadow-none cursor-pointer"
                  >
                    <Star className="h-3.5 w-3.5 stroke-[2px]" />
                    Rate this Store
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {storesData && storesData.meta?.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs font-black text-black uppercase tracking-wider">
            Page {storesData.meta.page} of {storesData.meta.totalPages} (
            {storesData.meta.total} stores)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white text-black font-black uppercase tracking-wider hover:bg-neo-secondary hover:shadow-neo-sm disabled:opacity-40 transition-all text-xs cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5 stroke-[3px]" /> Prev
            </button>
            <button
              disabled={page >= storesData.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white text-black font-black uppercase tracking-wider hover:bg-neo-secondary hover:shadow-neo-sm disabled:opacity-40 transition-all text-xs cursor-pointer"
            >
              Next <ChevronRight className="h-3.5 w-3.5 stroke-[3px]" />
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 border-8 border-black bg-white shadow-neo-xl space-y-5 animate-bounce-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-black uppercase tracking-wider m-0">
                  {ratingModal.mode === 'edit' ? 'Update Your Rating' : 'Rate this Store'}
                </h3>
                <p className="text-sm font-bold text-black/70 mt-1 uppercase tracking-wide truncate max-w-[200px]">
                  {ratingModal.store.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setRatingModal(null);
                  setSelectedRating(0);
                }}
                className="p-1.5 border-2 border-black bg-white hover:bg-neo-accent text-black hover:shadow-neo-sm transition-all"
              >
                <X className="h-4 w-4 stroke-[3px]" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
              <StarRatingInput
                value={selectedRating}
                onChange={setSelectedRating}
                size="h-10 w-10"
              />
              <p className="text-sm font-black text-black uppercase tracking-wider">
                {ratingLabel[selectedRating] ?? ''}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRatingModal(null);
                  setSelectedRating(0);
                }}
                className="flex-1 py-2.5 border-4 border-black bg-white hover:bg-neo-secondary text-black text-sm font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={submitRatingMutation.isPending || selectedRating === 0}
                className="flex-1 py-2.5 border-4 border-black bg-neo-secondary hover:bg-neo-accent disabled:bg-neo-secondary/50 text-black text-sm font-black uppercase tracking-wider transition-all shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitRatingMutation.isPending && (
                  <Loader2 className="h-4 w-4 stroke-[3px] animate-spin" />
                )}
                {ratingModal.mode === 'edit' ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
