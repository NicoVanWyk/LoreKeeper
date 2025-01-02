// Base Imports
import React, { useEffect, useState } from 'react';
// CSS Import
import styles from '../css/SchoolsPage.module.css';
// Service Imports
import { getUserProfile } from '../../services/userService';
import { addClass, getClasses, updateClass } from '../../services/magicService';
// Context Imports
import { useAuth } from '../../contexts/authContext';

function ClassesPage() {
    // --Receive the current user from the authContext
    const { currentUser } = useAuth();
    // UseStates
    // --Checks if the current user is an admin
    const [isAdmin, setIsAdmin] = useState(false);
    // --Controls wether or not editing fields are shown
    const [isEditing, setIsEditing] = useState(false);
    // --The id of the class that is currently being edited
    const [selectedClassId, setSelectedClassId] = useState(null);
    // --Controls wether or not the user is adding a class
    const [isAdding, setIsAdding] = useState(false);
    // --Holds all of the classes
    const [classes, setClasses] = useState([]);

    // Initial Data for a class
    const [classValues, setClassValues] = useState({
        title: '',
        description: '',
        notes: '',
        commonSchools: []
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

        // Fetch all of the data for the classes
        const fetchClasses = async () => {
            try {
                const fetchedClasses = await getClasses();
                setClasses(fetchedClasses);
            } catch (error) {
                console.error('Error fetching classes: ', error);
            }
        };

        checkUserRole();
        fetchClasses();
    }, [currentUser]);

    // Handle form changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setClassValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };
    // --Handle form submission
    const handleSubmit = async () => {
        try {
            if (isEditing) {
                await updateClass(selectedClassId, classValues);
                setIsEditing(false);
            } else {
                await addClass(classValues);
            }
            setClassValues({
                title: '',
                description: '',
                notes: '',
                commonSchools: []
            });
            setIsAdding(false);
            const fetchedClasses = await getClasses();
            setClasses(fetchedClasses);
        } catch (error) {
            console.error('Error adding/updating class:', error);
        }
    };
    // Handle which class is being edited
    const handleEdit = (classItem) => {
        setSelectedClassId(classItem.id);
        setClassValues(classItem);
        setIsEditing(true);
        setIsAdding(true);
    };

    return (
        <div className={styles.container}>
            <h1>Magic Classes</h1>
            {isAdmin ? (
                <>
                    {/* Is the user adding a class? */}
                    {isAdding ? (
                        <div className={styles.subschoolInputsContainer}>
                            <input
                                type="text"
                                name="title"
                                placeholder="Class Title"
                                value={classValues.title}
                                onChange={handleInputChange}
                                className={styles.schoolInput}
                            />
                            <input
                                type="text"
                                name="description"
                                placeholder="Description"
                                value={classValues.description}
                                onChange={handleInputChange}
                                className={styles.schoolInput}
                            />
                            <input
                                type="text"
                                name="notes"
                                placeholder="Notes"
                                value={classValues.notes}
                                onChange={handleInputChange}
                                className={styles.schoolInput}
                            />
                            <input
                                type="text"
                                name="commonSchools"
                                placeholder="Common Schools (comma separated)"
                                value={classValues.commonSchools.join(', ')}
                                onChange={(e) => setClassValues({ ...classValues, commonSchools: e.target.value.split(',').map(s => s.trim()) })}
                                className={styles.schoolInput}
                            />

                            <div className={styles.buttonContainer}>
                                <button onClick={handleSubmit} className='btnPrimary'>Confirm</button>
                                <button onClick={() => setIsAdding(false)} className='btnSecondary'>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsAdding(true)} className='btnPrimary'>Add Class</button>
                    )}
                </>
            ) : null}

            {classes.map(classItem => (
                <div key={classItem.id} className={styles.section}>
                    <h2>{classItem.title}</h2>
                    <p>{classItem.description}</p>
                    <p><strong>Notes:</strong> {classItem.notes}</p>
                    <p><strong>Common Schools:</strong> {classItem.commonSchools.join(', ')}</p>

                    {/* Is the user editing a class? */}
                    {isAdmin ? (
                        <button onClick={() => handleEdit(classItem)} style={{ marginTop: '25px' }} className='btnPrimary'>Edit</button>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export default ClassesPage;