'use client';

import { FLEET_DATA } from '@/data/fleetData';
import { sendBookingQuote } from '@/lib/actions/sendBookingQuote';
import { AlertCircle, ArrowRight, CheckCircle2, MapPin, Navigation, ShieldCheck, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const POPULAR_LOCATIONS = [
  'Boston Logan International Airport (BOS) - Terminal A',
  'Boston Logan International Airport (BOS) - Terminal B',
  'Boston Logan International Airport (BOS) - Terminal C',
  'Boston Logan International Airport (BOS) - Terminal E (International)',
  'Hanscom Field Private Aviation (BED) - Bedford, MA',
  'T.F. Green International Airport (PVD) - Providence, RI',
  'Manchester-Boston Regional Airport (MHT) - Manchester, NH',
  'Worcester Regional Airport (ORH) - Worcester, MA',
  'John F. Kennedy International Airport (JFK) - New York, NY',
  'LaGuardia Airport (LGA) - New York, NY',
  'Newark Liberty International Airport (EWR) - Newark, NJ',
  'Back Bay & Copley Square, Boston, MA',
  'Downtown Financial District, Boston, MA',
  'Seaport District & Waterfront, Boston, MA',
  'Harvard Square, Cambridge, MA',
  'Kendall Square Biotech Hub, Cambridge, MA',
  'Chestnut Hill & Newton, MA',
  'Wellesley & Weston Executive Belt, MA',
  'Lexington & Concord, MA',
  'Suburban Westborough & Framingham, MA',
  'Midtown Manhattan & Times Square, New York, NY',
  'Penn Station & Hudson Yards, New York, NY',
];

interface LocationResult {
  display_name: string;
}

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('Airport Transportation');
  const [selectedVehicle, setSelectedVehicle] = useState(FLEET_DATA[0].slug);

  // Route Inputs & Autocomplete State
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupFinalized, setPickupFinalized] = useState(false);
  const [dropoffFinalized, setDropoffFinalized] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>(POPULAR_LOCATIONS);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>(POPULAR_LOCATIONS);

  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDropoff, setLoadingDropoff] = useState(false);

  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('12:00');
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [hourlyCount, setHourlyCount] = useState(3);
  const [flightNumber, setFlightNumber] = useState('');

  // Distance & Duration Calculation State
  const [estimatedMiles, setEstimatedMiles] = useState(14.5);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  const [status, setStatus] = useState<{ success?: boolean; confirmationNumber?: string; message?: string; error?: string }>({});
  const [loading, setLoading] = useState(false);

  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const dropoffContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickupContainerRef.current && !pickupContainerRef.current.contains(e.target as Node)) {
        setShowPickupDropdown(false);
      }
      if (dropoffContainerRef.current && !dropoffContainerRef.current.contains(e.target as Node)) {
        setShowDropoffDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Location Search for Pickup
  useEffect(() => {
    if (!pickup || pickup.trim().length < 2) {
      setPickupSuggestions(POPULAR_LOCATIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingPickup(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}&limit=6&addressdetails=1`);
        if (res.ok) {
          const data: LocationResult[] = await res.json();
          if (data && data.length > 0) {
            const liveResults = data.map((item) => item.display_name);
            setPickupSuggestions(liveResults);
          } else {
            setPickupSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(pickup.toLowerCase())));
          }
        } else {
          setPickupSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(pickup.toLowerCase())));
        }
      } catch (err) {
        setPickupSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(pickup.toLowerCase())));
      } finally {
        setLoadingPickup(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [pickup]);

  // Live Location Search for Dropoff
  useEffect(() => {
    if (!dropoff || dropoff.trim().length < 2) {
      setDropoffSuggestions(POPULAR_LOCATIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingDropoff(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoff)}&limit=6&addressdetails=1`);
        if (res.ok) {
          const data: LocationResult[] = await res.json();
          if (data && data.length > 0) {
            const liveResults = data.map((item) => item.display_name);
            setDropoffSuggestions(liveResults);
          } else {
            setDropoffSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(dropoff.toLowerCase())));
          }
        } else {
          setDropoffSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(dropoff.toLowerCase())));
        }
      } catch (err) {
        setDropoffSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(dropoff.toLowerCase())));
      } finally {
        setLoadingDropoff(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [dropoff]);

  // Estimate distance and travel time based on pickup & dropoff strings
  useEffect(() => {
    if (!pickup || !dropoff) return;

    const p = pickup.toLowerCase();
    const d = dropoff.toLowerCase();

    let miles = 15.0;
    let mins = 30;

    // Smart distance heuristic engine for Greater Boston & New England
    if (p.includes('logan') || p.includes('bos') || d.includes('logan') || d.includes('bos')) {
      if (p.includes('nyc') || d.includes('nyc') || p.includes('jfk') || d.includes('jfk') || p.includes('york') || d.includes('york')) {
        miles = 215.0;
        mins = 240;
      } else if (p.includes('providence') || d.includes('providence') || p.includes('pvd') || d.includes('pvd')) {
        miles = 58.0;
        mins = 65;
      } else if (p.includes('cambridge') || d.includes('cambridge')) {
        miles = 8.5;
        mins = 20;
      } else if (p.includes('newton') || d.includes('newton')) {
        miles = 14.0;
        mins = 32;
      } else if (p.includes('lexington') || d.includes('lexington')) {
        miles = 18.5;
        mins = 38;
      } else {
        miles = 12.5;
        mins = 28;
      }
    } else if (p.includes('nyc') || d.includes('nyc') || p.includes('manhattan') || d.includes('manhattan')) {
      miles = 215.0;
      mins = 240;
    } else if (p.includes('worcester') || d.includes('worcester')) {
      miles = 45.0;
      mins = 50;
    } else {
      miles = 16.0;
      mins = 35;
    }

    setEstimatedMiles(miles);
    setEstimatedMinutes(mins);
  }, [pickup, dropoff]);

  const chosenVehicleObj = FLEET_DATA.find((v) => v.slug === selectedVehicle) || FLEET_DATA[0];

  // System calculated price function
  const calculateVehiclePrice = (vehicle: typeof FLEET_DATA[0]) => {
    const rate = vehicle.rateHourly || 85;

    if (selectedService.includes('Hourly')) {
      const total = rate * Math.max(2, hourlyCount);
      return {
        totalPrice: total.toFixed(2),
        durationLabel: `${hourlyCount} Hours Requested`,
        formulaLabel: `$${rate}/hr × ${hourlyCount} hrs`,
      };
    } else {
      // Calculate based on travel duration (minimum 1.5 hours chauffeur block)
      const hoursDecimal = Math.max(1.5, Math.ceil((estimatedMinutes / 60) * 2) / 2);
      const total = rate * hoursDecimal;
      return {
        totalPrice: total.toFixed(2),
        durationLabel: `${estimatedMinutes} mins (~${hoursDecimal} hrs)`,
        formulaLabel: `$${rate}/hr × ${hoursDecimal} hrs`,
      };
    }
  };

  const currentVehiclePrice = calculateVehiclePrice(chosenVehicleObj);

  async function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus({});

    const formData = new FormData(e.currentTarget);
    const serviceLabel = selectedService.includes('Hourly') ? `${selectedService} (${hourlyCount} Hours)` : selectedService;

    formData.set('serviceType', serviceLabel);
    formData.set('vehicleSlug', selectedVehicle);
    formData.set('pickupLocation', pickup);
    formData.set('dropoffLocation', dropoff);
    formData.set('pickupDate', pickupDate);
    formData.set('pickupTime', pickupTime);
    formData.set('passengers', passengers.toString());
    formData.set('luggage', luggage.toString());
    formData.set('flightNumber', flightNumber);
    formData.set('estimatedPrice', currentVehiclePrice.totalPrice);

    // Create Stripe Pre-Authorization Hold
    try {
      const intentRes = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentVehiclePrice.totalPrice,
          vehicleSlug: selectedVehicle,
          pickupLocation: pickup,
          dropoffLocation: dropoff,
        }),
      });

      if (intentRes.ok) {
        const intentData = await intentRes.json();
        if (intentData.paymentIntentId) {
          formData.set('stripePaymentIntentId', intentData.paymentIntentId);
          formData.set('paymentStatus', 'HOLD_PLACED');
        }
      }
    } catch (holdErr) {
      console.warn('Payment hold creation warning:', holdErr);
    }

    const specialReqs = formData.get('specialRequests')?.toString() || '';
    const calcNotes = `Calculated Distance: ${estimatedMiles} miles | Duration: ${estimatedMinutes} mins | System Estimated Price: $${currentVehiclePrice.totalPrice}`;
    formData.set('specialRequests', specialReqs ? `${specialReqs} [${calcNotes}]` : calcNotes);

    const result = await sendBookingQuote({}, formData);

    setLoading(false);
    setStatus(result);
  }

  // Map is ONLY shown when both pickup and dropoff locations are selected & final!
  const isBothLocationsFinal = pickupFinalized && dropoffFinalized && pickup.trim().length >= 3 && dropoff.trim().length >= 3;

  // Google Maps Embed URL for Visualizing Route
  const mapOrigin = encodeURIComponent(pickup || 'Boston Logan Airport');
  const mapDestination = encodeURIComponent(dropoff || 'Boston MA');
  const googleMapEmbedUrl = `https://maps.google.com/maps?q=from+${mapOrigin}+to+${mapDestination}&output=embed`;

  return (
    <div className="contact-form-wrap">
      {/* ── Step Indicator Bar ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: step >= 1 ? '#c5a46d' : '#64748b', fontWeight: 700, fontSize: '0.875rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)' : '#1e293b', color: step >= 1 ? '#0b0f17' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            1
          </div>
          <span>1. Service</span>
        </div>

        <div style={{ flex: 1, height: '2px', backgroundColor: '#1e293b', margin: '0 1rem' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #c5a46d 0%, #d4af37 100%)', width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', transition: 'all 0.3s ease' }}></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: step >= 2 ? '#c5a46d' : '#64748b', fontWeight: 700, fontSize: '0.875rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)' : '#1e293b', color: step >= 2 ? '#0b0f17' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            2
          </div>
          <span>2. Vehicle</span>
        </div>

        <div style={{ flex: 1, height: '2px', backgroundColor: '#1e293b', margin: '0 1rem' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #c5a46d 0%, #d4af37 100%)', width: step === 3 ? '100%' : '0%', transition: 'all 0.3s ease' }}></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: step >= 3 ? '#c5a46d' : '#64748b', fontWeight: 700, fontSize: '0.875rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 3 ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)' : '#1e293b', color: step >= 3 ? '#0b0f17' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            3
          </div>
          <span>3. Confirmation</span>
        </div>
      </div>

      {status.success ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)', color: '#0b0f17', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(197, 164, 109, 0.3)' }}>
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Reservation Request Submitted!
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '440px', lineHeight: 1.6, margin: '0 auto' }}>
            {status.message}
          </p>

          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(197, 164, 109, 0.3)', borderRadius: '14px', padding: '1.25rem', width: '100%', maxWidth: '460px', margin: '1rem 0', textAlign: 'left' }}>
            <div style={{ color: '#c5a46d', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Confirmation Code: {status.confirmationNumber}</span>
              <span style={{ backgroundColor: '#c5a46d', color: '#0b0f17', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem' }}>Est. Total: ${currentVehiclePrice.totalPrice}</span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong style={{ color: '#ffffff' }}>Service:</strong> {selectedService}</div>
              <div><strong style={{ color: '#ffffff' }}>Vehicle:</strong> {chosenVehicleObj.name}</div>
              <div><strong style={{ color: '#ffffff' }}>Pickup (Start Point):</strong> {pickup}</div>
              <div><strong style={{ color: '#ffffff' }}>Destination (End Point):</strong> {dropoff || 'City Centre'}</div>
              <div><strong style={{ color: '#ffffff' }}>Distance &amp; Time:</strong> {estimatedMiles} miles ({estimatedMinutes} mins)</div>
              <div><strong style={{ color: '#ffffff' }}>Date &amp; Time:</strong> {pickupDate || 'Scheduled'} at {pickupTime}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setStatus({});
              setPickup('');
              setDropoff('');
              setPickupFinalized(false);
              setDropoffFinalized(false);
            }}
            className="btn btn--gold"
            style={{ padding: '0.75rem 2rem', fontSize: '0.875rem' }}
          >
            Book Another Transfer
          </button>
        </div>
      ) : (
        <div className="theme-form">
          {/* ── STEP 1: SERVICES DROPDOWN & LIVE SEARCH ROUTE ────── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Services Dropdown */}
              <div className="form-group">
                <label className="form-label" style={{ color: '#ffffff' }}>
                  Select Service <span className="req">*</span>
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="form-select"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 700, borderColor: '#cbd5e1', fontSize: '0.95rem', height: '48px' }}
                >
                  <option value="Airport Transportation">✈️ Airport Transportation</option>
                  <option value="Hourly Private Chauffeur">🕐 Hourly Private Chauffeur</option>
                  <option value="Long Distance City-to-City Transfer">🗺️ Long Distance City-to-City Transfer</option>
                  <option value="Luxury Chauffeur & Limousine">👑 Luxury Chauffeur &amp; Limousine</option>
                  <option value="Event Limo Service">🎉 Event Limo Service</option>
                  <option value="Private Wedding Limo">💒 Private Wedding Limo</option>
                </select>
              </div>

              {/* Live Search Pickup & Dropoff Inputs */}
              <div className="form-row">
                {/* Pickup Location Field */}
                <div className="form-group" style={{ position: 'relative' }} ref={pickupContainerRef}>
                  <label className="form-label">
                    Pickup Location <span className="req">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      value={pickup}
                      onFocus={() => setShowPickupDropdown(true)}
                      onChange={(e) => {
                        setPickup(e.target.value);
                        setPickupFinalized(false);
                        setShowPickupDropdown(true);
                      }}
                      onBlur={() => {
                        if (pickup.trim().length >= 3) setPickupFinalized(true);
                      }}
                      placeholder="Type location, airport, or hotel name..."
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    {loadingPickup && (
                      <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c5a46d' }} />
                    )}
                  </div>

                  {/* Pickup Live Search Dropdown */}
                  {showPickupDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        marginTop: '4px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        maxHeight: '230px',
                        overflowY: 'auto',
                      }}
                    >
                      {pickupSuggestions.map((loc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setPickup(loc);
                            setPickupFinalized(true);
                            setShowPickupDropdown(false);
                          }}
                          style={{
                            padding: '0.65rem 1rem',
                            fontSize: '0.825rem',
                            color: '#0f172a',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 500,
                            lineHeight: 1.4,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          <MapPin size={15} style={{ color: '#b8860b', flexShrink: 0 }} />
                          <span>{loc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drop-off Location Field */}
                <div className="form-group" style={{ position: 'relative' }} ref={dropoffContainerRef}>
                  <label className="form-label">
                    Drop-off Location <span className="req">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      value={dropoff}
                      onFocus={() => setShowDropoffDropdown(true)}
                      onChange={(e) => {
                        setDropoff(e.target.value);
                        setDropoffFinalized(false);
                        setShowDropoffDropdown(true);
                      }}
                      onBlur={() => {
                        if (dropoff.trim().length >= 3) setDropoffFinalized(true);
                      }}
                      placeholder="Type destination, address, or city..."
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    {loadingDropoff && (
                      <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c5a46d' }} />
                    )}
                  </div>

                  {/* Dropoff Live Search Dropdown */}
                  {showDropoffDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        marginTop: '4px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        maxHeight: '230px',
                        overflowY: 'auto',
                      }}
                    >
                      {dropoffSuggestions.map((loc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setDropoff(loc);
                            setDropoffFinalized(true);
                            setShowDropoffDropdown(false);
                          }}
                          style={{
                            padding: '0.65rem 1rem',
                            fontSize: '0.825rem',
                            color: '#0f172a',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 500,
                            lineHeight: 1.4,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          <MapPin size={15} style={{ color: '#b8860b', flexShrink: 0 }} />
                          <span>{loc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Google Map Route Preview (ONLY displayed when both locations are final!) */}
              {isBothLocationsFinal && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b8860b', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Navigation size={18} />
                      <span>Google Map Route &amp; Distance Matrix</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#334155' }}>
                      <span>Distance: <strong style={{ color: '#b8860b', fontWeight: 800 }}>{estimatedMiles} Miles</strong></span>
                      <span>Duration: <strong style={{ color: '#b8860b', fontWeight: 800 }}>{estimatedMinutes} Mins</strong></span>
                    </div>
                  </div>

                  <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <iframe
                      src={googleMapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Google Route Preview"
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Date, Time & Options */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Transfer Date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Pickup Time <span className="req">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                {selectedService.includes('Hourly') ? (
                  <div className="form-group">
                    <label className="form-label">Requested Hours (Min 2 Hrs)</label>
                    <select
                      value={hourlyCount}
                      onChange={(e) => setHourlyCount(Number(e.target.value))}
                      className="form-select"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 24].map((num) => (
                        <option key={num} value={num}>
                          {num} Hours Dedicated Chauffeur
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Flight Tail # (If Airport Pickup)</label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="e.g. DL 1420 (Flight status tracking)"
                      className="form-input"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Passengers</label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="form-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((num) => (
                      <option key={num} value={num}>
                        {num} Passengers
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Luggage Bags</label>
                  <select
                    value={luggage}
                    onChange={(e) => setLuggage(Number(e.target.value))}
                    className="form-select"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} Suitcases
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!pickup || !dropoff || !pickupDate) {
                    alert('Please provide Pickup (Start Point), Drop-off (Destination) and Transfer Date.');
                    return;
                  }
                  setPickupFinalized(true);
                  setDropoffFinalized(true);
                  setStep(2);
                }}
                className="btn btn--gold btn--full"
                style={{ height: '52px', marginTop: '0.5rem', fontSize: '0.925rem' }}
              >
                <span>Calculate Rate &amp; Select Vehicle</span>
                <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            </div>
          )}

          {/* ── STEP 2: VEHICLE SELECTION & CALCULATED PRICE ──────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Select Vehicle &amp; System Calculated Price
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                    Calculated for {estimatedMiles} miles / {estimatedMinutes} mins route from {pickup} to {dropoff}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ color: '#c5a46d', fontSize: '0.8rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ← Edit Route
                </button>
              </div>

              <div className="booking-vehicles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {FLEET_DATA.map((vehicle) => {
                  const isSelected = selectedVehicle === vehicle.slug;
                  const priceInfo = calculateVehiclePrice(vehicle);

                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle.slug)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: isSelected ? '2px solid #b8860b' : '1px solid #e2e8f0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 10px 30px rgba(184, 134, 11, 0.22)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <div style={{ height: '155px', overflow: 'hidden', position: 'relative', backgroundColor: '#0b0f17' }}>
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Calculated Price Badge */}
                        <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(11, 15, 23, 0.92)', color: '#c5a46d', border: '1px solid rgba(197, 164, 109, 0.5)', fontSize: '0.85rem', fontWeight: 800, padding: '0.35rem 0.75rem', borderRadius: '20px', backdropFilter: 'blur(6px)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                          ${priceInfo.totalPrice}
                        </span>

                        {isSelected && (
                          <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#b8860b', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase' }}>
                            ✓ Selected
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b8860b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {vehicle.category}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                            {priceInfo.formulaLabel}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                          {vehicle.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.85rem 0' }}>
                          {vehicle.model}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontWeight: 600 }}>
                          <span>👥 {vehicle.passengerCapacity} Passengers</span>
                          <span>🧳 {vehicle.luggageCapacity} Bags</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ flex: 1, height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn--gold"
                  style={{ flex: 2, height: '50px', fontSize: '0.9rem' }}
                >
                  <span>Enter Passenger Details (${currentVehiclePrice.totalPrice})</span>
                  <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: PASSENGER DETAILS & FINAL SUBMIT ──────────── */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Passenger Information &amp; Submit Reservation
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ color: '#c5a46d', fontSize: '0.8rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ← Change Vehicle
                </button>
              </div>

              {/* Trip Summary Card */}
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(197, 164, 109, 0.3)', borderRadius: '14px', padding: '1.15rem 1.35rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Service</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{selectedService}</strong>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Selected Fleet</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{chosenVehicleObj.name}</strong>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Distance &amp; Time</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{estimatedMiles} miles ({estimatedMinutes} mins)</strong>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Calculated Total Fare</span>
                  <strong style={{ color: '#c5a46d', fontSize: '1.1rem', fontWeight: 800 }}>${currentVehiclePrice.totalPrice}</strong>
                </div>
              </div>

              {status.error && (
                <div className="contact-alert contact-alert--error">
                  <AlertCircle size={20} className="contact-alert__icon" />
                  <span>{status.error}</span>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Full Passenger Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. John Smith"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. john@example.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Mobile Phone Number <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. (617) 784-0264"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Child Seat or Special Requests</label>
                  <input
                    type="text"
                    name="specialRequests"
                    placeholder="e.g. Infant rear-facing seat, quiet ride"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ flex: 1, height: '54px', backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn--gold"
                  style={{ flex: 2, height: '54px', fontSize: '0.95rem' }}
                >
                  {loading ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Reservation Request (${currentVehiclePrice.totalPrice})</span>
                      <ShieldCheck size={18} style={{ marginLeft: '0.5rem' }} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
