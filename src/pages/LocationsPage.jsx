import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddLocationForm from '../components/AddLocationForm';
import { useAuth } from '../contexts/authContext';
import { getUserProfile } from '../services/userService';
import { getAllLocations } from '../services/locationService';
import styles from './css/LocationsPage.module.css';

function LocationsPage() {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showDistanceForm, setShowDistanceForm] = useState(false);
    const [locations, setLocations] = useState([]);
    const [coords, setCoords] = useState({ x: '', y: '', a: '', b: '' });
    const [distance, setDistance] = useState(null);
    const [travelTime, setTravelTime] = useState(null);
    const [roadType, setRoadType] = useState('ruined_highway'); // Default road type
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserRole = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getUserProfile(currentUser.uid);
                    if (userDoc.role === 'admin') {
                        setIsAdmin(true);
                    }
                } catch (error) {
                    console.error('Error fetching user role: ', error);
                }
            }
        };
        checkUserRole();
    }, [currentUser]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const locations = await getAllLocations();
                setLocations(locations);
            } catch (error) {
                console.error('Error fetching locations: ', error);
            }
        };
        fetchLocations();
    }, []);

    const filteredLocations = locations
        .filter(location =>
            searchTerm ? location.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
        );

    const handleLocationSelect = (event, type) => {
        const locationId = event.target.value;
        const location = locations.find(loc => loc.id === locationId);

        if (location && location.coordinates.includes(';')) {
            const [x, y] = location.coordinates.split(';').map(Number);
            if (type === 'first') {
                setCoords(prev => ({ ...prev, x, y }));
            } else {
                setCoords(prev => ({ ...prev, a: x, b: y }));
            }
        } else {
            alert('Invalid coordinates format for selected location.');
        }
    };

    const calculateDistance = () => {
        const x = parseFloat(coords.x);
        const y = parseFloat(coords.y);
        const a = parseFloat(coords.a);
        const b = parseFloat(coords.b);

        if (isNaN(x) || isNaN(y) || isNaN(a) || isNaN(b)) {
            alert('Please enter valid numbers for all coordinates.');
            return;
        }

        const pixelDistance = Math.sqrt((a - x) ** 2 + (b - y) ** 2);
        const miles = pixelDistance; // 1px = 1 mile based on your scale

        let adjustedDistance;
        switch (roadType) {
            case 'reclaimed_road':
                adjustedDistance = miles * 1.15;
                break;
            case 'old_road':
                adjustedDistance = miles * 1.3;
                break;
            case 'pathless_wilds':
                adjustedDistance = miles * 1.5;
                break;
            case 'ruined_highway':
            default:
                adjustedDistance = miles * 1.1;
                break;
        }

        let estimatedTime = adjustedDistance / 3; // Assuming 3 mph walking speed
        let actualTime = estimatedTime * 3; // If traveling for 8 hours per day

        const formatTime = (time) => {
            if (time < 24) {
                return `${time.toFixed(2)} hours`;
            } else {
                return `${(time / 24).toFixed(2)} days`;
            }
        };

        setDistance(adjustedDistance.toFixed(2));
        setTravelTime({ estimated: formatTime(estimatedTime), actual: formatTime(actualTime) });
    };

    return (
        <div className="container">
            {isAdmin && (
                <>
                    <button className="btnPrimary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Location'}
                    </button>
                    {showForm && <AddLocationForm />}
                </>
            )}

            <button className="btnPrimary" onClick={() => setShowDistanceForm(!showDistanceForm)}>
                {showDistanceForm ? 'Close Calculator' : 'Calculate Distance'}
            </button>

            {showDistanceForm && (
                <div className={styles.distanceForm}>
                    <h2>Calculate Distance</h2>

                    <h3>Select Road Type</h3>
                    <select value={roadType} onChange={(e) => setRoadType(e.target.value)}>
                        <option value="ruined_highway">Ruined Imperial Highways (+10%)</option>
                        <option value="reclaimed_road">Reclaimed Roads (+15%)</option>
                        <option value="old_road">Old Roads (+30%)</option>
                        <option value="pathless_wilds">Pathless Wilds (+50%)</option>
                    </select>

                    <div className="row">
                        <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                            <h3>Location 1</h3>
                            <select onChange={(e) => handleLocationSelect(e, 'first')}>
                                <option value="">Select a location</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>{location.name}</option>
                                ))}
                            </select>
                            <input type="number" placeholder="X" value={coords.x} onChange={(e) => setCoords({ ...coords, x: e.target.value })} />
                            <input type="number" placeholder="Y" value={coords.y} onChange={(e) => setCoords({ ...coords, y: e.target.value })} />
                        </div>

                        <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                            <h3>Location 2</h3>
                            <select onChange={(e) => handleLocationSelect(e, 'second')}>
                                <option value="">Select a location</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>{location.name}</option>
                                ))}
                            </select>
                            <input type="number" placeholder="A" value={coords.a} onChange={(e) => setCoords({ ...coords, a: e.target.value })} />
                            <input type="number" placeholder="B" value={coords.b} onChange={(e) => setCoords({ ...coords, b: e.target.value })} />
                        </div>
                    </div>

                    <button onClick={calculateDistance} className='btnSecondary'>Calculate</button>
                    {distance && travelTime && (
                        <p>Distance: {distance} miles | Estimated Travel Time: {travelTime.estimated} (non-stop) | Actual Travel Time: {travelTime.actual} (8h/day)</p>
                    )}
                </div>
            )
            }

            <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className={styles.cardsContainer}>
                {filteredLocations.map(location => (
                    <div style={{ cursor: 'pointer' }} key={location.id} className={styles.card} onClick={() => navigate(`/locations/${location.id}`)}>
                        <h2>{location.name}</h2>
                        <p>{location.type}</p>
                        <p><b>{location.coordinates ?? "N/A"}</b></p>
                    </div>
                ))}
            </div>
        </div >
    );
}

export default LocationsPage;