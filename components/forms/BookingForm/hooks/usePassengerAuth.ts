'use client';

import { useEffect, useState } from 'react';
import type { PassengerProfile, SavedCard } from '../types';

export function usePassengerAuth() {
  const [passenger, setPassenger] = useState<PassengerProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Passenger Contact State
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Saved Cards
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('new');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExp, setNewCardExp] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');

  const fetchSavedCards = async () => {
    try {
      const res = await fetch('/api/passenger/cards');
      if (res.ok) {
        const data = await res.json();
        const cards: SavedCard[] = data.cards || [];
        setSavedCards(cards);
        if (cards.length > 0) {
          setSelectedCardId(cards[0].id);
        } else {
          setSelectedCardId('new');
        }
      }
    } catch (e) {
      console.error('Failed to fetch saved cards:', e);
    }
  };

  const checkPassengerAuth = async () => {
    setCheckingAuth(true);
    try {
      const res = await fetch('/api/passenger/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.passenger) {
          setPassenger(data.passenger);
          setPassengerName(data.passenger.fullName || '');
          setPassengerEmail(data.passenger.email || '');
          setPassengerPhone(data.passenger.phone || '');
          fetchSavedCards();
        } else {
          setPassenger(null);
        }
      } else {
        setPassenger(null);
      }
    } catch {
      setPassenger(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkPassengerAuth();
  }, []);

  const handlePassengerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/passenger/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      setPassenger(data.passenger);
      setPassengerName(data.passenger.fullName || '');
      setPassengerEmail(data.passenger.email || '');
      setPassengerPhone(data.passenger.phone || '');
      fetchSavedCards();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePassengerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/passenger/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setPassenger(data.passenger);
      setPassengerName(data.passenger.fullName || '');
      setPassengerEmail(data.passenger.email || '');
      setPassengerPhone(data.passenger.phone || '');
      fetchSavedCards();
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    passenger,
    checkingAuth,
    authMode,
    setAuthMode,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    regFullName,
    setRegFullName,
    regEmail,
    setRegEmail,
    regPassword,
    setRegPassword,
    regPhone,
    setRegPhone,
    authError,
    setAuthError,
    authLoading,
    passengerName,
    setPassengerName,
    passengerEmail,
    setPassengerEmail,
    passengerPhone,
    setPassengerPhone,
    specialRequests,
    setSpecialRequests,
    savedCards,
    selectedCardId,
    setSelectedCardId,
    newCardNumber,
    setNewCardNumber,
    newCardExp,
    setNewCardExp,
    newCardCvc,
    setNewCardCvc,
    handlePassengerLogin,
    handlePassengerRegister,
  };
}
