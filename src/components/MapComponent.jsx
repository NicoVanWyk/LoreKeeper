// Base Imports
import React, { useState } from 'react';
// Import Leaflet
import { MapContainer, ImageOverlay, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Set the bounds of the map for plotting
const bounds = [[0, 0], [5111, 6809]];

const MapComponent = () => {
    // Usestates
    // --Base Map
    const [baseMap, setBaseMap] = useState("countryNames"); // ---Default Map
    // --Map Overlay
    const [regionOverlayVisible, setRegionOverlayVisible] = useState(true);
    const [regionOpacity, setRegionOpacity] = useState(0.5);

    // URLs for base maps
    const baseMapUrls = {
        countryNames: "https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/maps%2FCountries.png?alt=media&token=98f48d3f-55fe-47f7-91b4-3b119efece16",
        landmarksCities: "https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/maps%2FLandmarksAndCities.png?alt=media&token=a14789e0-c2eb-4ef8-ad61-9305c7543189",
        combined: "https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/maps%2FCombined.png?alt=media&token=46d40850-1382-47d1-a0d3-2aeb1b603b5b"
    };

    // URL for the regions overlay
    const regionOverlayUrl = "https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/maps%2FRegions.png?alt=media&token=35b3f4f8-6302-4a39-99a8-4042762853d0";

    return (
        <div>
            {/* Control Panel */}
            <div style={{ padding: '10px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                <h2>Map Controls</h2>

                {/* --Base Map Selection */}
                <label>
                    Base Map:
                    <select
                        value={baseMap}
                        onChange={(e) => setBaseMap(e.target.value)}
                        style={{ marginLeft: '10px' }}
                    >
                        <option value="countryNames">Country Names</option>
                        <option value="landmarksCities">Landmarks & Cities</option>
                        <option value="combined">Both</option>
                    </select>
                </label>

                {/* --Toggle Region Overlay */}
                <label style={{ marginLeft: '20px' }}>
                    Show Region Overlay
                    <input
                        type="checkbox"
                        checked={regionOverlayVisible}
                        onChange={(e) => setRegionOverlayVisible(e.target.checked)}
                    />
                </label>

                {/* --Slider for Region Overlay Opacity */}
                {regionOverlayVisible && (
                    <div style={{ marginTop: '10px' }}>
                        <label>Region Overlay Opacity:</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={regionOpacity}
                            onChange={(e) => setRegionOpacity(e.target.value)}
                            style={{ marginLeft: '10px', width: '200px' }}
                        />
                        <span style={{ marginLeft: '10px' }}>{Math.round(regionOpacity * 100)}%</span>
                    </div>
                )}
            </div>

            {/* Map */}
            <MapContainer
                center={[1285.28, 2000]}
                zoom={0}
                minZoom={-3}
                maxZoom={2}
                style={{ height: 'calc(100vh - 100px)', width: '100%' }}
                crs={L.CRS.Simple}
            >
                {/* --Base Map */}
                <ImageOverlay
                    url={baseMapUrls[baseMap]}
                    bounds={bounds}
                />

                {/* --Region Overlay */}
                {regionOverlayVisible && (
                    <ImageOverlay
                        url={regionOverlayUrl}
                        bounds={bounds}
                        opacity={regionOpacity} // ---Set opacity dynamically
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;