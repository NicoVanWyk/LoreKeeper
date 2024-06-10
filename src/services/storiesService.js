import { addDoc, collection, getDocs, doc, getDoc } from 'firebase/firestore';
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
        const querySnapshot = await getDocs(storiesCollection);
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
            const chaptersSnapshot = await getDocs(chaptersCollection);
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
        await addDoc(chaptersCollection, chapterData);
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