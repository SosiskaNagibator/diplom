import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapPicker.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const shortenAddress = (data) => {
  if (!data) return null;
  const addr = data.address || {};
  if (!addr.house_number && !addr.building) return null;
  const parts = [];
  if (addr.road) parts.push(addr.road);
  if (addr.house_number) parts.push(addr.house_number);
  else if (addr.building) parts.push(addr.building);
  if (addr.suburb) parts.push(addr.suburb);
  else if (addr.neighbourhood) parts.push(addr.neighbourhood);
  if (addr.city) parts.push(addr.city);
  else if (addr.town) parts.push(addr.town);
  else if (addr.village) parts.push(addr.village);
  return parts.length ? parts.join(', ') : data.display_name || '';
};

const LocationMarker = ({ setAddress, setCoords, mapRef }) => {
  const [position, setPosition] = useState(null);
  const timeoutRef = useRef(null);
  const [error, setError] = useState('');

  const fetchAddress = (lat, lng) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
      .then(res => res.ok ? res.json() : Promise.reject('HTTP error'))
      .then(data => {
        const shortAddr = shortenAddress(data);
        if (!shortAddr) {
          setError('Выберите конкретный дом с номером');
          setAddress('⚠️ Адрес без номера дома');
          return;
        }
        setError('');
        setAddress(shortAddr);
      })
      .catch(() => {
        setError('Ошибка получения адреса');
        setAddress('Адрес не найден');
      });
  };

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setCoords([lat, lng]);
      setError('');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fetchAddress(lat, lng), 600);
    },
  });

  useEffect(() => {
    if (mapRef) mapRef.current = map;
  }, [map, mapRef]);

  const setMarker = (lat, lng, address) => {
    setPosition([lat, lng]);
    setCoords([lat, lng]);
    setAddress(address);
    map.setView([lat, lng], 15);
  };

  useEffect(() => {
    if (mapRef) {
      mapRef.current.setMarker = setMarker;
    }
  }, [map, mapRef]);

  return position ? <Marker position={position} /> : null;
};

const SuggestionItem = ({ suggestion, onSelect }) => {
  const addr = suggestion.address || {};
  let mainLine = '';
  if (addr.road) mainLine += addr.road;
  if (addr.house_number) mainLine += `, ${addr.house_number}`;
  else if (addr.building) mainLine += `, ${addr.building}`;
  if (!mainLine) mainLine = suggestion.display_name.split(',').slice(0, 2).join(',');
  
  let secondLine = '';
  if (addr.city) secondLine += addr.city;
  else if (addr.town) secondLine += addr.town;
  else if (addr.village) secondLine += addr.village;
  if (addr.suburb) secondLine += `, ${addr.suburb}`;
  else if (addr.neighbourhood) secondLine += `, ${addr.neighbourhood}`;
  if (!secondLine) {
    secondLine = suggestion.display_name.split(',').slice(2, 4).join(',');
  }
  return (
    <li
      onMouseDown={() => onSelect(suggestion)}
      className="px-3 py-2 hover:bg-amber-50 cursor-pointer border-b last:border-0 flex items-start gap-2"
    >
      <span className="text-gray-500 mt-0.5">📍</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{mainLine}</div>
        <div className="text-xs text-gray-500 truncate">{secondLine}</div>
      </div>
    </li>
  );
};

const MapPicker = ({ onAddressSelect, initialAddress }) => {
  const [address, setAddress] = useState(initialAddress || '');
  const [coords, setCoords] = useState([55.76, 37.64]);
  const [query, setQuery] = useState(initialAddress || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const searchTimeout = useRef(null);
  const isSelecting = useRef(false);
  const selectedAddressRef = useRef('');
  const isInitialized = useRef(false);

  const geocodeAddress = (text) => {
    if (!text || text.length < 2) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=1`)
      .then(res => res.ok ? res.json() : Promise.reject('HTTP error'))
      .then(data => {
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const shortAddr = shortenAddress(item);
          if (shortAddr) {
            setCoords([lat, lng]);
            if (mapRef.current && mapRef.current.setMarker) {
              mapRef.current.setMarker(lat, lng, shortAddr);
            } else if (mapRef.current) {
              mapRef.current.setView([lat, lng], 15);
            }
            setAddress(shortAddr);
            setQuery(shortAddr);
            selectedAddressRef.current = shortAddr;
            onAddressSelect(shortAddr);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (initialAddress && !isInitialized.current) {
      isInitialized.current = true;
      selectedAddressRef.current = initialAddress;
      setAddress(initialAddress);
      setQuery(initialAddress);
      geocodeAddress(initialAddress);
    }
  }, [initialAddress]);

  const goToCoords = (lat, lng, addressText) => {
    selectedAddressRef.current = addressText;
    setCoords([lat, lng]);
    setAddress(addressText);
    setQuery(addressText);
    setError('');
    setSuggestions([]);
    setShowSuggestions(false);
    onAddressSelect(addressText);
    if (mapRef.current && mapRef.current.setMarker) {
      mapRef.current.setMarker(lat, lng, addressText);
    } else if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
      mapRef.current.fire('click', { latlng: { lat, lng } });
    }
  };

  const searchAddress = (text) => {
    if (!text || text.length < 2) return;
    if (text === selectedAddressRef.current) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=1`)
      .then(res => res.ok ? res.json() : Promise.reject('HTTP error'))
      .then(data => {
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const shortAddr = shortenAddress(item);
          if (!shortAddr) {
            setError('Выберите конкретный дом с номером');
            setAddress('⚠️ Адрес без номера дома');
            return;
          }
          setError('');
          goToCoords(lat, lng, shortAddr);
        } else {
          setError('Адрес не найден');
          setAddress('');
        }
      })
      .catch(() => {
        setError('Ошибка поиска');
      });
  };

  useEffect(() => {
    if (!query || query.length < 2 || isSelecting.current) return;
    if (query === selectedAddressRef.current) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchAddress(query);
    }, 500);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (query === selectedAddressRef.current && isInitialized.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=6`)
        .then(res => res.ok ? res.json() : Promise.reject('HTTP error'))
        .then(data => {
          if (query === selectedAddressRef.current) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
          }
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        })
        .catch(() => setSuggestions([]));
    }, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query]);

  const selectSuggestion = (suggestion) => {
    isSelecting.current = true;
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const shortAddr = shortenAddress(suggestion);
    if (!shortAddr) {
      setError('Выберите конкретный дом с номером');
      setAddress('⚠️ Адрес без номера дома');
      return;
    }
    setError('');
    goToCoords(lat, lng, shortAddr);
    setShowSuggestions(false);
    setSuggestions([]);
    setTimeout(() => { isSelecting.current = false; }, 300);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setError('');
    if (val === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      setAddress('');
      selectedAddressRef.current = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      if (suggestions.length > 0) {
        selectSuggestion(suggestions[0]);
      } else if (query.trim()) {
        searchAddress(query);
      }
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && query !== selectedAddressRef.current) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className="relative p-2 border-b border-gray-200 flex gap-2" style={{ zIndex: 1000 }}>
        <input
          type="text"
          placeholder="Введите адрес (улица, дом, город)..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
        <button
          type="button"
          onClick={() => { if (query.trim()) searchAddress(query); }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg transition"
        >
          Найти
        </button>

        {showSuggestions && suggestions.length > 0 && (
          <ul
            className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-[9999] max-h-52 overflow-y-auto"
            style={{ marginTop: '4px' }}
          >
            {suggestions.map((s, idx) => (
              <SuggestionItem key={idx} suggestion={s} onSelect={selectSuggestion} />
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 text-sm text-red-600 bg-red-50 border-b border-red-200">
          ⚠️ {error}
        </div>
      )}

      <MapContainer
        center={coords}
        zoom={13}
        zoomControl={false}
        className={styles.mapWrapper}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker setAddress={setAddress} setCoords={setCoords} mapRef={mapRef} />
      </MapContainer>

      <div className={styles.addressLine}>
        {address ? `📍 ${address}` : 'Нажмите на карту или введите адрес'}
      </div>
    </div>
  );
};

export default MapPicker;