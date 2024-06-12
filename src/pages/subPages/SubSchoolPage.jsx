import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../css/SchoolsPage.module.css';
import { useAuth } from '../../contexts/authContext';
import { updateSchool, getSchool } from '../../services/magicService';
import { getUserProfile } from '../../services/userService';

function SubSchoolPage() {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { subschool, schoolId } = location.state;

    const [isAdmin, setIsAdmin] = useState(false);
    const [subschoolValues, setSubschoolValues] = useState(subschool);

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
        checkUserRole();
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSubschoolValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const fetchedSchool = await getSchool(schoolId);
            const updatedSubschools = fetchedSchool.subschools.map(sub => 
                sub.name === subschool.name ? subschoolValues : sub
            );

            await updateSchool(schoolId, { ...fetchedSchool, subschools: updatedSubschools });
            navigate('/magic/schools');
        } catch (error) {
            console.error('Error updating subschool:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Edit Subschool</h1>
            <div className={styles.subschoolInputsContainer}>
                {isAdmin ? (
                    <>
                        <input
                            type="text"
                            name="name"
                            placeholder="Subschool Name"
                            value={subschoolValues.name}
                            onChange={handleInputChange}
                        />
                        <textarea
                            type="text"
                            name="description"
                            placeholder="Subschool Description"
                            value={subschoolValues.description}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="practitionerTitle"
                            placeholder="Subschool Practitioner Title"
                            value={subschoolValues.practitionerTitle}
                            onChange={handleInputChange}
                        />
                        <textarea
                            type="text"
                            name="notes"
                            placeholder="Subschool Notes"
                            value={subschoolValues.notes}
                            onChange={handleInputChange}
                        />
                        <div className={styles.buttonContainer}>
                            <button onClick={handleSave} className='btnPrimary'>Save</button>
                            <button onClick={() => navigate('/magic/schools')} className='btnSecondary'>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className='preserve-whitespace'><strong>Name:</strong> {subschoolValues.name}</p>
                        <p className='preserve-whitespace'><strong>Description:</strong> {subschoolValues.description}</p>
                        <p className='preserve-whitespace'><strong>Practitioner Title:</strong> {subschoolValues.practitionerTitle}</p>
                        <p className='preserve-whitespace'><strong>Notes:</strong> {subschoolValues.notes}</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default SubSchoolPage;