import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/SchoolsPage.module.css';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { addSchool, getSchools, updateSchool } from '../../services/magicService';

function SchoolsPage() {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [schools, setSchools] = useState([]);
    const [schoolValues, setSchoolValues] = useState({
        name: '',
        description: '',
        practitionerTitle: '',
        notes: '',
        subschools: []
    });
    const [subschoolValues, setSubschoolValues] = useState({
        name: '',
        description: '',
        practitionerTitle: '',
        notes: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
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

        const fetchSchools = async () => {
            try {
                const fetchedSchools = await getSchools();
                setSchools(fetchedSchools);
            } catch (error) {
                console.error('Error fetching schools: ', error);
            }
        };

        checkUserRole();
        fetchSchools();
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSchoolValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

    const handleSubschoolInputChange = (e) => {
        const { name, value } = e.target;
        setSubschoolValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

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

    const handleEdit = (school) => {
        setSelectedSchoolId(school.id);
        setSchoolValues(school);
        setIsEditing(true);
        setIsAdding(true);
    };

    const handleSubschoolClick = (subschool, schoolId) => {
        navigate(`/subschools/${subschool.name}`, { state: { subschool, schoolId } });
    };

    return (
        <div className={styles.container}>
            <h1>Schools Of Magic</h1>
            {isAdmin ? (
                <>
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
                                <input
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
                                    <input
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

            {schools.map(school => (
                <div key={school.id} className={styles.section}>
                    <h2>{school.name}</h2>
                    <p>{school.description}</p>
                    <p><strong>Practitioner:</strong> {school.practitionerTitle}</p>
                    <p><strong>Notes:</strong> {school.notes}</p>
                    <h2>SubSchools:</h2>
                    <div className={styles.subschoolsContainer}>
                        {school.subschools.map((subschool, index) => (
                            <div key={index} className={styles.subschoolCard}>
                                <h3 onClick={() => handleSubschoolClick(subschool, school.id)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                                    {index + 1}. {subschool.name}
                                </h3>
                                <p>{subschool.description}</p>
                                <p><strong>Practitioner:</strong> {subschool.practitionerTitle}</p>
                                <p><strong>Notes:</strong> {subschool.notes}</p>
                            </div>
                        ))}
                    </div>

                    {isAdmin ? (
                        <button onClick={() => { handleEdit(school); window.scrollTo(0, 0); }} style={{ marginTop: '25px' }} className='btnPrimary'>Edit School</button>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export default SchoolsPage;