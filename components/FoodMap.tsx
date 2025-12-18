
import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { Restaurant, Review, User } from '../types';
import { NUTN_COORDS, ICONS } from '../constants';
import { getAIFoodAdvice } from '../services/geminiService';

interface FoodMapProps {
  user: User;
}

// Mock initial restaurants
const INITIAL_RESTAURANTS: Restaurant[] = [
  { id: '1', name: '紅樓食堂', lat: 22.9845, lng: 120.2058, description: 'NUTN校內最平價的選擇，午休時間必排隊。', reviews: [] },
  { id: '2', name: '五妃街蛋餅', lat: 22.9855, lng: 120.2030, description: '台南超人氣蛋餅，南大學生的早餐聖地。', reviews: [] },
  { id: '3', name: '慶中街綠豆湯', lat: 22.9868, lng: 120.2065, description: '傳統古早味綠豆湯，夏天消暑首選。', reviews: [] },
  { id: '4', name: '府連東路早午餐', lat: 22.9830, lng: 120.2110, description: '適合週末聚餐的高質感早午餐店。', reviews: [] },
  { id: '5', name: '開山路陽春麵', lat: 22.9880, lng: 120.2070, description: '台南在地老店，滷味是一絕。', reviews: [] },
];

const FoodMap: React.FC<FoodMapProps> = ({ user }) => {
  const mapRef = useRef<L.Map | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRes, setSelectedRes] = useState<Restaurant | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Load persisted restaurants
    const saved = localStorage.getItem('nutn_restaurants');
    if (saved) {
      setRestaurants(JSON.parse(saved));
    } else {
      setRestaurants(INITIAL_RESTAURANTS);
      localStorage.setItem('nutn_restaurants', JSON.stringify(INITIAL_RESTAURANTS));
    }

    if (!mapRef.current) {
      mapRef.current = L.map('map-container').setView(NUTN_COORDS, 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && restaurants.length > 0) {
      // Clear markers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) mapRef.current?.removeLayer(layer);
      });

      // Add school marker
      L.marker(NUTN_COORDS, {
        icon: L.divIcon({
          className: 'bg-red-600 w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg',
          html: '<span class="text-[10px] font-bold">NUTN</span>',
          iconSize: [32, 32]
        })
      }).addTo(mapRef.current).bindPopup('台南大學紅樓');

      // Add restaurant markers
      restaurants.forEach((res) => {
        const marker = L.marker([res.lat, res.lng], {
          icon: L.divIcon({
            className: 'bg-orange-500 w-6 h-6 rounded-full border-2 border-white shadow flex items-center justify-center text-white',
            html: '🍴',
            iconSize: [24, 24]
          })
        }).addTo(mapRef.current!);
        
        marker.on('click', () => {
          setSelectedRes(res);
          setAiAdvice('');
        });
      });
    }
  }, [restaurants]);

  const handleAddReview = () => {
    if (!selectedRes || !newComment.trim()) return;

    const newReview: Review = {
      userId: user.id,
      nickname: user.nickname,
      rating: newRating,
      comment: newComment,
      timestamp: Date.now()
    };

    const updatedRestaurants = restaurants.map(r => 
      r.id === selectedRes.id 
        ? { ...r, reviews: [newReview, ...r.reviews] } 
        : r
    );

    setRestaurants(updatedRestaurants);
    localStorage.setItem('nutn_restaurants', JSON.stringify(updatedRestaurants));
    setSelectedRes(updatedRestaurants.find(r => r.id === selectedRes.id) || null);
    setNewComment('');
    setNewRating(5);
  };

  const calculateAvgRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const fetchAiAdvice = async () => {
    if (!selectedRes) return;
    setLoadingAi(true);
    const reviews = selectedRes.reviews.map(r => r.comment);
    const advice = await getAIFoodAdvice(selectedRes.name, reviews.length > 0 ? reviews : ["暫時沒有評論"]);
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div id="map-container" className="flex-1 min-h-[400px] lg:min-h-full"></div>
      
      {selectedRes ? (
        <div className="w-full lg:w-96 border-l bg-slate-50 flex flex-col h-full animate-in slide-in-from-right duration-300">
          <div className="p-6 bg-white border-b">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold">{selectedRes.name}</h2>
              <button onClick={() => setSelectedRes(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  // Fix: Properly typing the component as React.FC allows use of the 'key' prop in JSX mapping
                  <Star key={s} filled={s <= Number(calculateAvgRating(selectedRes.reviews))} />
                ))}
              </div>
              <span className="text-lg font-bold text-slate-700">{calculateAvgRating(selectedRes.reviews)}</span>
              <span className="text-sm text-slate-400">({selectedRes.reviews.length} 則評論)</span>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{selectedRes.description}</p>
            
            <button 
              onClick={fetchAiAdvice}
              disabled={loadingAi}
              className="w-full bg-slate-900 text-white text-sm py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingAi ? 'AI 正在思考...' : '✨ 學長 AI 建議'}
            </button>
            
            {aiAdvice && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-normal italic">
                「{aiAdvice}」
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">寫下評論</h3>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setNewRating(s)}>
                    <Star filled={s <= newRating} size="w-6 h-6" />
                  </button>
                ))}
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="分享一下你的餐後心得..."
                className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none"
              />
              <button 
                onClick={handleAddReview}
                className="w-full bg-orange-500 text-white font-bold py-2 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
              >
                發布評價
              </button>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">所有評論</h3>
              {selectedRes.reviews.length > 0 ? (
                selectedRes.reviews.map((rev, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">{rev.nickname}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => (
                          // Fix: Properly typing the component as React.FC allows use of the 'key' prop in JSX mapping
                          <Star key={s} filled={s <= rev.rating} size="w-3 h-3" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(rev.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center text-sm py-4 italic">目前還沒有人留下足跡</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex w-96 items-center justify-center p-8 text-center text-slate-400 border-l bg-slate-50">
          <div>
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              {ICONS.Pin}
            </div>
            <p className="text-sm font-medium">點擊地圖上的圖標查看詳細資訊</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Fix: Defining Star as a React.FC ensures standard JSX attributes like 'key' are recognized by TypeScript
const Star: React.FC<{ filled: boolean; size?: string }> = ({ filled, size = "w-4 h-4" }) => (
  <svg className={`${size} ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default FoodMap;
