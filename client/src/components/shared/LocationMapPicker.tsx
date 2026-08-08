import L from "leaflet";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon for factory locations
const factoryIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface FactoryLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface LocationMapPickerProps {
  latitude: number;
  longitude: number;
  radius: number;
  onLocationChange?: (lat: number, lng: number) => void;
  editable?: boolean;
  factoryLocations?: FactoryLocation[];
}

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationMapPicker({
  latitude,
  longitude,
  radius,
  onLocationChange,
  editable = true,
  factoryLocations = [],
}: LocationMapPickerProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState<[number, number]>([
    latitude,
    longitude,
  ]);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const handleLocationChange = (lat: number, lng: number) => {
    if (!editable) return;
    setPosition([lat, lng]);
    onLocationChange?.(lat, lng);
  };

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {editable && (
          <MapClickHandler onLocationChange={handleLocationChange} />
        )}

        {/* User/Selected Location Marker */}
        <Marker position={position} icon={userIcon}>
          <Popup>
            <div className="text-center" dir="rtl">
              <strong>
                📍{" "}
                {editable
                  ? t("locationMap.selectedLocation")
                  : t("locationMap.currentLocation")}
              </strong>
              <br />
              <span className="text-xs font-mono">
                {position[0].toFixed(6)}°, {position[1].toFixed(6)}°
              </span>
            </div>
          </Popup>
        </Marker>

        {/* User/Selected Location Accuracy Circle */}
        <Circle
          center={position}
          radius={radius}
          pathOptions={{
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.1,
          }}
        />

        {/* Factory Location Markers */}
        {factoryLocations.map((factory) => (
          <div key={factory.id}>
            <Marker
              position={[factory.latitude, factory.longitude]}
              icon={factoryIcon}
            >
              <Popup>
                <div className="text-center" dir="rtl">
                  <strong>🏭 {factory.name}</strong>
                  <br />
                  <span className="text-xs">
                    {t("locationMap.range")}: {factory.radius}{" "}
                    {t("locationMap.meters")}
                  </span>
                  <br />
                  <span className="text-xs font-mono">
                    {factory.latitude.toFixed(6)}°,{" "}
                    {factory.longitude.toFixed(6)}°
                  </span>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[factory.latitude, factory.longitude]}
              radius={factory.radius}
              pathOptions={{
                color: "red",
                fillColor: "red",
                fillOpacity: 0.1,
              }}
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
