export const CONCEPT_SHORTCUTS = {
    'A': {symbol: 'A', term: 'A', concept: 'Darkness', translation: 'Darkness', type: 'Noun'},
    'B': {symbol: 'B', term: 'B', concept: 'Light', translation: 'Light', type: 'Noun'},
    'C': {symbol: 'C', term: 'C', concept: 'Muse', translation: 'Muse', type: 'Noun'},
    'D': {symbol: 'D', term: 'D', concept: 'Magic', translation: 'Magic', type: 'Noun'},
    'E': {symbol: 'E', term: 'E', concept: 'Good', translation: 'Good', type: 'Noun'},
    'F': {symbol: 'F', term: 'F', concept: 'Evil', translation: 'Evil', type: 'Noun'},
    'G': {symbol: 'G', term: 'G', concept: 'War', translation: 'War', type: 'Noun'},
    'H': {symbol: 'H', term: 'H', concept: 'Peace', translation: 'Peace', type: 'Noun'},
    'I': {symbol: 'I', term: 'I', concept: 'War & Peace', translation: 'War & Peace', type: 'Noun'},
    'J': {symbol: 'J', term: 'J', concept: 'Plague', translation: 'Plague', type: 'Noun'},
    'K': {symbol: 'K', term: 'K', concept: 'Death', translation: 'Death', type: 'Noun'},
    'L': {symbol: 'L', term: 'L', concept: 'Life', translation: 'Life', type: 'Noun'},
    'M': {symbol: 'M', term: 'M', concept: 'Limbo', translation: 'Limbo', type: 'Noun'},
    'N': {symbol: 'N', term: 'N', concept: 'Justice', translation: 'Justice', type: 'Noun'},
    'O': {symbol: 'O', term: 'O', concept: 'Apathy', translation: 'Apathy', type: 'Noun'},
    'P': {symbol: 'P', term: 'P', concept: 'Hate', translation: 'Hate', type: 'Noun'},
    'Q': {symbol: 'Q', term: 'Q', concept: 'Vengeance', translation: 'Vengeance', type: 'Noun'},
    'R': {symbol: 'R', term: 'R', concept: 'Emotion', translation: 'Emotion', type: 'Noun'},
    'S': {symbol: 'S', term: 'S', concept: 'Nature', translation: 'Nature', type: 'Noun'},
    'T': {symbol: 'T', term: 'T', concept: 'Android', translation: 'Android', type: 'Noun'},
    'U': {symbol: 'U', term: 'U', concept: 'Mercy', translation: 'Mercy', type: 'Noun'},
    'V': {symbol: 'V', term: 'V', concept: 'Good Morality', translation: 'Good Morality', type: 'Noun'},
    'W': {symbol: 'W', term: 'W', concept: 'Bad Morality', translation: 'Bad Morality', type: 'Noun'},
    'X': {symbol: 'X', term: 'X', concept: 'Morality', translation: 'Morality', type: 'Noun'},
    'Y': {symbol: 'Y', term: 'Y', concept: 'Valor', translation: 'Valor', type: 'Noun'},
    'Z': {symbol: 'Z', term: 'Z', concept: 'Time', translation: 'Time', type: 'Noun'},
    '{': {symbol: '{', term: '{', concept: 'Kironaan (Planet)', translation: 'Kironaan (Planet)', type: 'Noun'},
    '}': {symbol: '}', term: '}', concept: 'Kironaan (People)', translation: 'Kironaan (People)', type: 'Noun'},
    '|': {symbol: '|', term: '|', concept: 'Kironaan (Language)', translation: 'Kironaan (Language)', type: 'Noun'},
    'Á': {symbol: 'Á', term: 'Á', concept: 'Love', translation: 'Love', type: 'Noun'},
    'É': {symbol: 'É', term: 'É', concept: 'Betrayal', translation: 'Betrayal', type: 'Noun'},
    'Í': {symbol: 'Í', term: 'Í', concept: 'Element', translation: 'Element', type: 'Noun'},
    'Ó': {symbol: 'Ó', term: 'Ó', concept: 'The Three Muses', translation: 'The Three Muses', type: 'Noun'},
    'Ú': {symbol: 'Ú', term: 'Ú', concept: 'The Black Book', translation: 'The Black Book', type: 'Noun'}
};

export const isConceptShortcut = (token) => {
    return CONCEPT_SHORTCUTS[token] !== undefined;
};

export const resolveConceptShortcut = (symbol) => {
    const concept = CONCEPT_SHORTCUTS[symbol];
    if (!concept) return null;

    return {
        term: concept.term,
        translation: concept.translation,
        type: concept.type,
        isConcept: true,
        symbol: concept.symbol,
        conceptName: concept.concept
    };
};