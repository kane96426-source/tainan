
import React from 'react';
import { Utensils, Calendar, MessageSquare, MapPin, Star, User, Plus, Search, Trash2, Heart, MessageCircle, Clock, ChevronUp } from 'lucide-react';

export const NUTN_COORDS: [number, number] = [22.9848, 120.2060];

export const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = 8 + i;
  return `${hour}:00 - ${hour}:50`;
});

export const DAYS = ['週一', '週二', '週三', '週四', '週五'];

export const CATEGORIES: string[] = ['情感', '學業', '生活', '閒聊'];

export const ICONS = {
  Food: <Utensils className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Chat: <MessageSquare className="w-5 h-5" />,
  Pin: <MapPin className="w-5 h-5" />,
  Star: <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />,
  User: <User className="w-5 h-5" />,
  Plus: <Plus className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Trash: <Trash2 className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Comment: <MessageCircle className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  Top: <ChevronUp className="w-4 h-4" />
};
