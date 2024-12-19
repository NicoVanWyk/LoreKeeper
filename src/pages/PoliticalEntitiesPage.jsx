import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddPoliticalEntityForm from '../components/AddPoliticalEntityForm';
import { useAuth } from '../contexts/authContext';
import { getUserProfile } from '../services/userService';
import { getAllPoliticalEntities } from '../services/politicalEntitiesService';
import styles from './css/LocationsPage.module.css';

function PoliticalEntitiesPage() {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [politicalEntities, setPoliticalEntities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // Filter for status
    const [regionFilter, setRegionFilter] = useState('All'); // Filter for region
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
        const fetchPoliticalEntities = async () => {
            try {
                const polEntities = await getAllPoliticalEntities();
                setPoliticalEntities(polEntities);
            } catch (error) {
                console.error('Error fetching political entities: ', error);
            }
        };
        fetchPoliticalEntities();
    }, []);

    const handleCardClick = (politicalEntityId) => {
        navigate(`/politicalEntities/${politicalEntityId}`);
    };

    const filteredEntities = politicalEntities
        .filter((entity) => {
            const matchesSearch =
                entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entity.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === 'All' || entity.status === statusFilter;

            const matchesRegion =
                regionFilter === 'All' ||
                entity.region.split(',').map((region) => region.trim()).includes(regionFilter);

            return matchesSearch && matchesStatus && matchesRegion;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="container">
            {/* Admin Controls */}
            {isAdmin && (
                <>
                    <button className={"btnPrimary"} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Political Entity'}
                    </button>
                    {showForm && <AddPoliticalEntityForm />}
                </>
            )}

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search Political Entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                style={{ margin: '20px 0', padding: '10px', width: '100%', maxWidth: '400px' }}
            />

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {/* Status Dropdown */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.dropdown}
                    style={{ padding: '10px' }}
                >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Dismantled">Dismantled</option>
                </select>

                {/* Region Dropdown */}
                <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className={styles.dropdown}
                    style={{ padding: '10px' }}
                >
                    <option value="All">All Regions</option>
                    <option value="Zikara">Zikara</option>
                    <option value="Crossing">Crossing</option>
                    <option value="Niscosi">Niscosi</option>
                    <option value="Dreo">Dreo</option>
                    <option value="Inoraniir">Inoraniir</option>
                    <option value="Hillgrave">Hillgrave</option>
                    <option value="Central Reach">Central Reach</option>
                    <option value="Irean Sea">Irean Sea</option>
                    <option value="Irean Channel">Irean Channel</option>
                    <option value="World's Edge">World's Edge</option>
                    <option value="Verdant March">Verdant March</option>
                    <option value="Great Nothing">Great Nothing</option>
                    <option value="Ember Coast">Ember Coast</option>
                </select>
            </div>

            {/* Political Entities Cards */}
            <div className={styles.cardsContainer}>
                {filteredEntities.length > 0 ? (
                    filteredEntities.map(politicalEntity => (
                        <div
                            style={{ cursor: 'pointer' }}
                            key={politicalEntity.id}
                            className={styles.card}
                            onClick={() => handleCardClick(politicalEntity.id)}
                        >
                            <h2>{politicalEntity.name}</h2>
                            <p><b>{politicalEntity.region}</b></p>
                            <p>
                                {politicalEntity.description.length > 100
                                    ? `${politicalEntity.description.slice(0, 100)}...`
                                    : politicalEntity.description}
                            </p>

                        </div>
                    ))
                ) : (
                    <p>No political entities match your search.</p>
                )}
            </div>
        </div>
    );
}

export default PoliticalEntitiesPage;