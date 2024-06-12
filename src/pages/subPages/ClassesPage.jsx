import React, { useEffect, useState } from 'react';
import styles from '../css/SchoolsPage.module.css'; // Import the shared CSS file
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { addClass, getClasses, updateClass } from '../../services/magicService';

function ClassesPage() {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(null);

    const [isAdding, setIsAdding] = useState(false);
    const [classes, setClasses] = useState([]);
    const [classValues, setClassValues] = useState({
        title: '',
        description: '',
        notes: '',
        commonSchools: []
    });

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setClassValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

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

                    {isAdmin ? (
                        <button onClick={() => handleEdit(classItem)} style={{ marginTop: '25px' }} className='btnPrimary'>Edit</button>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export default ClassesPage;