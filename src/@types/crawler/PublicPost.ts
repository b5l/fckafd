export interface InteractionStatistic {
    ['@type']: string;
    interactionType: string;
    userInteractionCount: number;
}

export interface Author {
    ['@type']: string;
    name: string;
    identifier: number;
    url: string;
    image?: any;
    sameAs?: string;
    foundingDate?: Date;
}

export interface Comment {
    ['@type']: string;
    identifier: string;
    dateCreated: Date;
    text: string;
    mentions?: any;
    author: Author;
}

export interface PublicPostJSON {
    ['@context']: string;
    ['@type']: string;
    dateCreated: Date;
    dateModified: Date;
    identifier: string;
    articleBody: string;
    url: string;
    isPartOf: string;
    headline: string;
    interactionStatistic: InteractionStatistic[];
    commentCount: number;
    comment: Comment[];
    author: Author;
    video?: any;
}
