import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, MapPin, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

// Fix default leaflet marker asset urls
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Bus Icon Generator
const createBusIcon = (status, busNumber, isSelected = false) => {
  let bgColor = '#10b981'; // Green (Active)
  let glowClass = '';

  if (status === 'Delayed') {
    bgColor = '#f59e0b'; // Amber
  } else if (status === 'Breakdown') {
    bgColor = '#f43f5e'; // Red
    glowClass = 'radar-alert';
  } else if (status === 'Replacement') {
    bgColor = '#06b6d4'; // Cyan
  } else if (status === 'Out of Service') {
    bgColor = '#64748b'; // Slate
  }

  const borderClass = isSelected ? 'border-2 border-white scale-110 shadow-2xl' : 'border border-slate-900';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div class="relative flex items-center justify-center ${glowClass}">
        <div style="background-color: ${bgColor};" class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ${borderClass} transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C18.1 6.8 17.2 6 16.2 6H4.8c-1 0-1.9.8-2.2 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path><circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle>
          </svg>
        </div>
        <div class="absolute -bottom-4 bg-slate-900/90 text-[9px] font-bold text-white px-1.5 py-0.2 rounded border border-slate-700 whitespace-nowrap shadow">
          ${busNumber || 'BUS'}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

// Custom Stop Icon
const createStopIcon = (seq, isTerminal = false) => {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div class="flex items-center justify-center">
        <div class="w-5 h-5 rounded-full ${isTerminal ? 'bg-indigo-500 ring-2 ring-indigo-300' : 'bg-slate-700'} border border-slate-300 flex items-center justify-center text-[9px] font-bold text-white shadow">
          ${seq}
        </div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// Auto-center handler component
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

export const LeafletMap = ({ 
  buses = [], 
  selectedBus = null, 
  route = null, 
  stops = [], 
  center = [16.5850, 82.0250], 
  zoom = 13,
  onSelectBus = () => {}
}) => {
  // Extract route coordinates for polyline
  const routePolylineCoords = useMemo(() => {
    if (stops && stops.length > 1) {
      return stops.map(s => [s.latitude, s.longitude]);
    }
    return [];
  }, [stops]);

  // Determine active center
  const mapCenter = useMemo(() => {
    if (selectedBus && selectedBus.latest_location?.latitude) {
      return [selectedBus.latest_location.latitude, selectedBus.latest_location.longitude];
    }
    if (stops && stops.length > 0) {
      return [stops[0].latitude, stops[0].longitude];
    }
    return center;
  }, [selectedBus, stops, center]);

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={mapCenter} zoom={zoom} />

        {/* Route Polyline */}
        {routePolylineCoords.length > 0 && (
          <Polyline
            positions={routePolylineCoords}
            pathOptions={{
              color: '#6366f1',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8',
            }}
          />
        )}

        {/* Route Stops */}
        {stops && stops.map((stop, idx) => (
          <Marker
            key={`stop-${stop.id || idx}`}
            position={[stop.latitude, stop.longitude]}
            icon={createStopIcon(stop.sequence || idx + 1, idx === 0 || idx === stops.length - 1)}
          >
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-slate-100 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Stop {stop.sequence || idx + 1}: {stop.stop_name}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Coordinates: {stop.latitude?.toFixed(4)}, {stop.longitude?.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fleet Bus Markers */}
        {buses.map((bus) => {
          const lat = bus.latest_location?.latitude || bus.latitude;
          const lng = bus.latest_location?.longitude || bus.longitude;

          if (!lat || !lng) return null;

          const isSelected = selectedBus && selectedBus.id === bus.id;

          return (
            <Marker
              key={`bus-${bus.id || bus.bus_id}`}
              position={[lat, lng]}
              icon={createBusIcon(bus.status, bus.bus_number, isSelected)}
              eventHandlers={{
                click: () => onSelectBus(bus),
              }}
            >
              <Popup>
                <div className="text-xs p-1 min-w-[180px]">
                  <div className="font-bold text-slate-100 text-sm flex items-center justify-between">
                    <span>Bus {bus.bus_number}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                      {bus.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Route: <strong>{bus.route_name || 'Assigned Route'}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Driver: {bus.driver_name || 'Driver on Duty'}
                  </div>
                  <div className="text-[10px] text-indigo-300 font-mono mt-1 pt-1 border-t border-slate-700 flex items-center justify-between">
                    <span>Speed: {bus.latest_location?.speed || bus.speed || 35} km/h</span>
                    <span>Live GPS</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-xl text-[11px] space-y-1.5 hidden sm:block">
        <div className="font-bold text-slate-300 mb-1">Transit Status</div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Active Bus
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Delayed
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span> Breakdown
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Replacement Bus
        </div>
      </div>
    </div>
  );
};
