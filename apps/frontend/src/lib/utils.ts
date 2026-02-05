import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Briefcase, Film, ShoppingCart, Car, Activity, Utensils, Zap, GraduationCap, Home, Gift, TrendingUp, HelpCircle } from 'lucide-react';
import { translations } from './translations';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map of category names (ID/EN) to translation keys
const CATEGORY_KEY_MAP: Record<string, keyof typeof translations.id.categories.items> = {
  // Indonesian
  'makanan & minuman': 'food',
  'makanan': 'food',
  'minuman': 'food',
  'transportasi': 'transport',
  'tempat tinggal': 'housing',
  'hiburan': 'entertainment',
  'kesehatan': 'health',
  'belanja': 'shopping',
  'pendidikan': 'education',
  'tagihan & utilitas': 'utilities',
  'tagihan': 'utilities',
  'lainnya': 'other',
  'gaji': 'salary',
  'bonus': 'bonus',
  'investasi': 'investment',
  'hadiah': 'gift',
  
  // English
  'food & drink': 'food',
  'food': 'food',
  'drink': 'food',
  'transportation': 'transport',
  'transport': 'transport',
  'housing': 'housing',
  'entertainment': 'entertainment',
  'health': 'health',
  'shopping': 'shopping',
  'education': 'education',
  'bills & utilities': 'utilities',
  'bills': 'utilities',
  'utilities': 'utilities',
  'other': 'other',
  'salary': 'salary',
  'investment': 'investment',
  'gift': 'gift',
  'business': 'business',
  'otherIncome': 'otherIncome'
};

export const getTranslatedCategory = (name: string, language: 'id' | 'en' = 'id') => {
  const lower = name.toLowerCase().trim();
  const key = CATEGORY_KEY_MAP[lower];
  
  if (key && translations[language].categories.items[key]) {
    return translations[language].categories.items[key];
  }
  
  return name;
};

export const getCategoryStyles = (category: string) => {
  const lower = category.toLowerCase();
  
  // Check mapped keys first for more accurate styling
  const key = CATEGORY_KEY_MAP[lower];
  
  if (key === 'food' || lower.includes('makan') || lower.includes('food')) 
    return { icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-400/20', border: 'border-orange-400/20', text: 'text-orange-400' };
  
  if (key === 'salary' || lower.includes('work') || lower.includes('gaji') || lower.includes('salary')) 
    return { icon: Briefcase, color: 'text-green-400', bg: 'bg-green-400/20', border: 'border-green-400/20', text: 'text-green-400' };
  
  if (key === 'entertainment' || lower.includes('entertainment') || lower.includes('hiburan') || lower.includes('film')) 
    return { icon: Film, color: 'text-red-400', bg: 'bg-red-400/20', border: 'border-red-400/20', text: 'text-red-400' };
  
  if (key === 'shopping' || lower.includes('shop') || lower.includes('belanja')) 
    return { icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400/20', text: 'text-blue-400' };
  
  if (key === 'transport' || lower.includes('trans') || lower.includes('car')) 
    return { icon: Car, color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400/20', text: 'text-purple-400' };
  
  if (key === 'health' || lower.includes('health') || lower.includes('kesehatan')) 
    return { icon: Activity, color: 'text-teal-400', bg: 'bg-teal-400/20', border: 'border-teal-400/20', text: 'text-teal-400' };
  
  if (key === 'utilities' || lower.includes('listrik') || lower.includes('air') || lower.includes('util') || lower.includes('bill')) 
    return { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/20', text: 'text-yellow-400' };
    
  if (key === 'education' || lower.includes('didik') || lower.includes('edu'))
    return { icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-400/20', border: 'border-indigo-400/20', text: 'text-indigo-400' };

  if (key === 'housing' || lower.includes('rumah') || lower.includes('house'))
    return { icon: Home, color: 'text-cyan-400', bg: 'bg-cyan-400/20', border: 'border-cyan-400/20', text: 'text-cyan-400' };

  if (key === 'investment' || lower.includes('invest'))
    return { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/20', border: 'border-emerald-400/20', text: 'text-emerald-400' };

  if (key === 'gift' || lower.includes('hadiah') || lower.includes('kado'))
    return { icon: Gift, color: 'text-pink-400', bg: 'bg-pink-400/20', border: 'border-pink-400/20', text: 'text-pink-400' };
  
  return { icon: HelpCircle, color: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-400/20', text: 'text-gray-400' };
};
