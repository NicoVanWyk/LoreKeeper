import { addDoc, collection, getDocs, doc, getDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const storiesCollection = collection(db, 'Stories');

export const addStory = async (storyData) => {
    try {
        const { chapters, ...story } = storyData;
        const docRef = await addDoc(storiesCollection, story);
        console.log('Story written with ID: ', docRef.id);

        if (chapters && chapters.length > 0) {
            const chaptersCollection = collection(db, `Stories/${docRef.id}/Chapters`);
            for (const chapter of chapters) {
                await addDoc(chaptersCollection, chapter);
            }
        }

        return docRef.id;
    } catch (error) {
        console.error('Error adding story: ', error);
        throw error;
    }
};

export const getAllStories = async () => {
    try {
        const q = query(storiesCollection, orderBy('publicationDate', 'asc'));
        const querySnapshot = await getDocs(q);
        const stories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return stories;
    } catch (error) {
        console.error('Error fetching stories: ', error);
        throw error;
    }
};

export const getStory = async (id) => {
    try {
        const storyDoc = doc(db, 'Stories', id);
        const storySnapshot = await getDoc(storyDoc);
        if (storySnapshot.exists()) {
            const storyData = { id: storySnapshot.id, ...storySnapshot.data() };

            const chaptersCollection = collection(db, `Stories/${id}/Chapters`);
            const q = query(chaptersCollection, orderBy('order', 'asc'));
            const chaptersSnapshot = await getDocs(q);
            const chapters = chaptersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            storyData.chapters = chapters;

            return storyData;
        } else {
            throw new Error('Story not found');
        }
    } catch (error) {
        console.error('Error fetching story: ', error);
        throw error;
    }
};

export const addChapterToStory = async (storyId, chapterData) => {
    try {
        const chaptersCollection = collection(db, `Stories/${storyId}/Chapters`);
        const q = query(chaptersCollection, orderBy('order', 'desc'));
        const querySnapshot = await getDocs(q);
        const lastChapter = querySnapshot.docs[0];
        const nextOrder = lastChapter ? lastChapter.data().order + 1 : 1;
        
        const newChapter = { ...chapterData, order: nextOrder };
        await addDoc(chaptersCollection, newChapter);
        console.log('Chapter added to story ID: ', storyId);
    } catch (error) {
        console.error('Error adding chapter: ', error);
        throw error;
    }
};

export const getChapter = async (storyId, chapterId) => {
    try {
        const chapterDoc = doc(db, `Stories/${storyId}/Chapters`, chapterId);
        const chapterSnapshot = await getDoc(chapterDoc);
        if (chapterSnapshot.exists()) {
            return { id: chapterSnapshot.id, ...chapterSnapshot.data() };
        } else {
            throw new Error('Chapter not found');
        }
    } catch (error) {
        console.error('Error fetching chapter: ', error);
        throw error;
    }
};

export const updateStory = async (id, storyData) => {
    try {
        const storyDoc = doc(db, 'Stories', id);
        await updateDoc(storyDoc, storyData);
        console.log('Story updated with ID: ', id);
    } catch (error) {
        console.error('Error updating story: ', error);
        throw error;
    }
};

export const updateChapter = async (storyId, chapterId, chapterData) => {
    try {
        const chapterDoc = doc(db, `Stories/${storyId}/Chapters`, chapterId);
        await updateDoc(chapterDoc, chapterData);
        console.log('Chapter updated with ID: ', chapterId);
    } catch (error) {
        console.error('Error updating chapter: ', error);
        throw error;
    }
};