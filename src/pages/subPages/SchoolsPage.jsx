// Base Imports
import React, { useEffect, useState } from 'react';
// CSS Import
import styles from '../css/SchoolsPage.module.css';
// Navigation Import
import { useNavigate } from 'react-router-dom';
// Service Imports
import { getUserProfile } from '../../services/userService';
import { addSchool, getSchools, updateSchool } from '../../services/magicService';
// Context Imports
import { useAuth } from '../../contexts/authContext';

function SchoolsPage() {
    // Enable Navigation
    const navigate = useNavigate();
    // --Receive the current user from the authContext
    const { currentUser } = useAuth();
    // UseStates
    // --Searching
    // ----Holds the user's search
    const [searchQuery, setSearchQuery] = useState('');
    // ----Which schools are shown based on the user's search
    const [filteredSchools, setFilteredSchools] = useState([]);
    // --Checks if the current user is an admin
    const [isAdmin, setIsAdmin] = useState(false);
    // --Is the user editing the page?
    const [isEditing, setIsEditing] = useState(false);
    // --Which school is selected for editing?
    const [selectedSchoolId, setSelectedSchoolId] = useState(null);
    // --Controls wether or not the user is adding a class
    const [isAdding, setIsAdding] = useState(false);
    // --Holds all of the schools received from the DB
    const [schools, setSchools] = useState([]);

    // Initial Data for a school
    const [schoolValues, setSchoolValues] = useState({
        name: '',
        description: '',
        practitionerTitle: '',
        notes: '',
        subschools: []
    });
    // Initial Data for a subschool
    const [subschoolValues, setSubschoolValues] = useState({
        name: '',
        description: '',
        practitionerTitle: '',
        notes: ''
    });

    useEffect(() => {
        // Check to see if the current user is an admin. 
        // TODO: See AddChapterPage ToDo
        const checkUserRole = async () => {
            try {
                const userDoc = await getUserProfile(currentUser.uid);
                if (userDoc.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Error fetching user role: ', error);
            }
        };

        // Fetch the schools
        const fetchSchools = async () => {
            try {
                const fetchedSchools = await getSchools();
                setSchools(fetchedSchools);
                setFilteredSchools(fetchedSchools);
            } catch (error) {
                console.error('Error fetching schools: ', error);
            }
        };

        checkUserRole();
        fetchSchools();
    }, [currentUser]);

    // Handle form changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSchoolValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };
    // --Handle subschool form changes
    const handleSubschoolInputChange = (e) => {
        const { name, value } = e.target;
        setSubschoolValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };
    // --Handle add subschool form submission
    const handleAddSubschool = () => {
        if (subschoolValues.name && subschoolValues.description && subschoolValues.practitionerTitle) {
            setSchoolValues(prevValues => ({
                ...prevValues,
                subschools: [...prevValues.subschools, subschoolValues]
            }));
            setSubschoolValues({
                name: '',
                description: '',
                practitionerTitle: '',
                notes: ''
            });
        } else {
            alert('Please complete all subschool fields before adding another.');
        }
    };
    // --Handle form submission
    const handleSubmit = async () => {
        try {
            if (isEditing) {
                await updateSchool(selectedSchoolId, schoolValues);
                setIsEditing(false);
            } else {
                await addSchool(schoolValues);
            }
            setSchoolValues({
                name: '',
                description: '',
                practitionerTitle: '',
                notes: '',
                subschools: []
            });
            setIsAdding(false);
            const fetchedSchools = await getSchools();
            setSchools(fetchedSchools);
        } catch (error) {
            console.error('Error adding/updating school:', error);
        }
    };
    // Handle which class is being edited
    const handleEdit = (school) => {
        setSelectedSchoolId(school.id);
        setSchoolValues(school);
        setIsEditing(true);
        setIsAdding(true);
    };

    // Navigate to the subschool page
    const handleSubschoolClick = (subschool, schoolId) => {
        navigate(`/subschools/${subschool.name}`, { state: { subschool, schoolId } });
    };

    // Change which items are displayed based on the user's search
    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = schools.filter(school =>
            school.name.toLowerCase().includes(query) ||
            school.description.toLowerCase().includes(query) ||
            school.practitionerTitle.toLowerCase().includes(query)
        );

        setFilteredSchools(filtered);
    };

    return (
        <div className={styles.container}>
            <h1>Schools Of Magic</h1>

            {/* Search bar */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search Schools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                />
            </div>

            {isAdmin ? (
                <>
                    {/* Is the user adding a school? */}
                    {isAdding ? (
                        <div>
                            <div className={styles.subschoolInputsContainer}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="School Name"
                                    value={schoolValues.name}
                                    onChange={handleInputChange}
                                    className={styles.subschoolInput}
                                />
                                <textarea
                                    type="text"
                                    name="description"
                                    placeholder="Description"
                                    value={schoolValues.description}
                                    onChange={handleInputChange}
                                    className={styles.subschoolInput}
                                />
                                <input
                                    type="text"
                                    name="practitionerTitle"
                                    placeholder="Practitioner Title"
                                    value={schoolValues.practitionerTitle}
                                    onChange={handleInputChange}
                                    className={styles.subschoolInput}
                                />
                                <input
                                    type="text"
                                    name="notes"
                                    placeholder="Notes"
                                    value={schoolValues.notes}
                                    onChange={handleInputChange}
                                    className={styles.subschoolInput}
                                />
                            </div>

                            <div>
                                <h2>Add Subschool</h2>

                                <div className={styles.subschoolInputsContainer}>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Subschool Name"
                                        value={subschoolValues.name}
                                        onChange={handleSubschoolInputChange}
                                    />
                                    <textarea
                                        type="text"
                                        name="description"
                                        placeholder="Subschool Description"
                                        value={subschoolValues.description}
                                        onChange={handleSubschoolInputChange}
                                    />
                                    <input
                                        type="text"
                                        name="practitionerTitle"
                                        placeholder="Subschool Practitioner Title"
                                        value={subschoolValues.practitionerTitle}
                                        onChange={handleSubschoolInputChange}
                                    />
                                    <input
                                        type="text"
                                        name="notes"
                                        placeholder="Subschool Notes"
                                        value={subschoolValues.notes}
                                        onChange={handleSubschoolInputChange}
                                    />
                                </div>

                                <div className={styles.subschoolButtonContainer}>
                                    <button onClick={handleAddSubschool} className='btnSecondary' style={{ textDecorationLine: 'underline', marginRight: '0px' }}>
                                        Add Subschool
                                    </button>
                                </div>
                            </div>

                            <div className={styles.buttonContainer}>
                                <button onClick={handleSubmit} className='btnPrimary'>Confirm</button>
                                <button onClick={() => setIsAdding(false)} className='btnSecondary'>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsAdding(true)} className='btnPrimary'>Add School</button>
                    )}
                </>
            ) : null}

            {/* Display the schools, based on the user's search */}
            {filteredSchools.map(school => (
                <div key={school.id} className={styles.section}>
                    <h2>{school.name}</h2>
                    <p>{school.description}</p>
                    <p><strong>Practitioner:</strong> {school.practitionerTitle}</p>
                    {school.notes && <p><strong>Notes:</strong> {school.notes}</p>}

                    {school.subschools?.length > 0 && (
                        <>
                            <h2>SubSchools:</h2>
                            <div className={styles.subschoolsContainer}>
                                {school.subschools
                                    .filter(subschool =>
                                        subschool.name || subschool.description || subschool.practitionerTitle || subschool.notes
                                    )
                                    .map((subschool, index) => (
                                        <div key={index} className={styles.subschoolCard}>
                                            <h3
                                                onClick={() => handleSubschoolClick(subschool, school.id)}
                                                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                            >
                                                {index + 1}. {subschool.name}
                                            </h3>
                                            {subschool.description && <p>{subschool.description}</p>}
                                            {subschool.practitionerTitle && <p><strong>Practitioner:</strong> {subschool.practitionerTitle}</p>}
                                            {subschool.notes && <p><strong>Notes:</strong> {subschool.notes}</p>}
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}

                    {/* Is the user editing a school? */}
                    {isAdmin && (
                        <button
                            onClick={() => { handleEdit(school); window.scrollTo(0, 0); }}
                            style={{ marginTop: '25px', marginBottom: '20px' }}
                            className='btnPrimary'
                        >
                            Edit School
                        </button>
                    )}
                </div>
            ))}

        </div>
    );
}

export default SchoolsPage;