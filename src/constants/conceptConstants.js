export const CONCEPT_SHORTCUTS = {
    'A': {symbol: 'A', term: 'nīrsél', concept: 'Darkness', translation: 'Darkness', type: 'Noun'},
    'B': {symbol: 'B', term: 'leksa', concept: 'Light', translation: 'Light', type: 'Noun'},
    'C': {symbol: 'C', term: 'qaïn', concept: 'Muse', translation: 'Muse', type: 'Noun'},
    'D': {symbol: 'D', term: 'Meko', concept: 'Magic', translation: 'Magic', type: 'Noun'},
    'E': {symbol: 'E', term: 'betra', concept: 'Good', translation: 'Good', type: 'Noun'},
    'F': {symbol: 'F', term: 'bín', concept: 'Evil', translation: 'Evil', type: 'Noun'},
    'G': {symbol: 'G', term: 'washi', concept: 'War', translation: 'War', type: 'Noun'},
    'H': {symbol: 'H', term: 'poso', concept: 'Peace', translation: 'Peace', type: 'Noun'},
    'I': {symbol: 'I', term: 'washo', concept: 'War & Peace', translation: 'War & Peace', type: 'Noun'},
    'J': {symbol: 'J', term: 'perhaäsi', concept: 'Plague', translation: 'Plague', type: 'Noun'},
    'K': {symbol: 'K', term: 'axenn', concept: 'Death', translation: 'Death', type: 'Noun'},
    'L': {symbol: 'L', term: 'danema', concept: 'Life', translation: 'Life', type: 'Noun'},
    'M': {symbol: 'M', term: 'axanéma', concept: 'Limbo', translation: 'Limbo', type: 'Noun'},
    'N': {symbol: 'N', term: 'requï', concept: 'Justice', translation: 'Justice', type: 'Noun'},
    'O': {symbol: 'O', term: 'sét', concept: 'Apathy', translation: 'Apathy', type: 'Noun'},
    'P': {symbol: 'P', term: 'rāss', concept: 'Hate', translation: 'Hate', type: 'Noun'},
    'Q': {symbol: 'Q', term: 'avenna', concept: 'Vengeance', translation: 'Vengeance', type: 'Noun'},
    'R': {symbol: 'R', term: 'virnān', concept: 'Emotion', translation: 'Emotion', type: 'Noun'},
    'S': {symbol: 'S', term: 'néska', concept: 'Nature', translation: 'Nature', type: 'Noun'},
    'T': {symbol: 'T', term: 'daquxx', concept: 'Android', translation: 'Android', type: 'Noun'},
    'U': {symbol: 'U', term: 'taré', concept: 'Mercy', translation: 'Mercy', type: 'Noun'},
    'V': {symbol: 'V', term: 'annmoäsi', concept: 'Good Morality', translation: 'Good Morality', type: 'Noun'},
    'W': {symbol: 'W', term: 'ennmoäsi', concept: 'Bad Morality', translation: 'Bad Morality', type: 'Noun'},
    'X': {symbol: 'X', term: 'moäsi', concept: 'Morality', translation: 'Morality', type: 'Noun'},
    'Y': {symbol: 'Y', term: 'vóosa', concept: 'Valor', translation: 'Valor', type: 'Noun'},
    'Z': {symbol: 'Z', term: 'tóäsi', concept: 'Time', translation: 'Time', type: 'Noun'},
    '{': {symbol: '{', term: 'kironān', concept: 'Kironaan (Planet)', translation: 'Kironaan (Planet)', type: 'Noun'},
    '}': {symbol: '}', term: 'kironān', concept: 'Kironaan (People)', translation: 'Kironaan (People)', type: 'Noun'},
    '|': {
        symbol: '|',
        term: 'kironān',
        concept: 'Kironaan (Language)',
        translation: 'Kironaan (Language)',
        type: 'Noun'
    },
    'Á': {symbol: 'Á', term: 'Lét', concept: 'Love', translation: 'Love', type: 'Noun'},
    'É': {symbol: 'É', term: 'llena', concept: 'Betrayal', translation: 'Betrayal', type: 'Noun'},
    'Í': {symbol: 'Í', term: 'ékraïsa', concept: 'Element', translation: 'Element', type: 'Noun'},
    'Ó': {symbol: 'Ó', term: 'disaqaïn', concept: 'The Three Muses', translation: 'The Three Muses', type: 'Noun'},
    'Ú': {symbol: 'Ú', term: 'dároxasal', concept: 'The Black Book', translation: 'The Black Book', type: 'Noun'}
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