export interface DocumentDto {
    userId: string,
    type: string, // blog, text, research paper, book
}

export interface UpdateDto {
    userId: string,
    documentId: string,
    levelsCompleted: Array<number>,
    quizTaken: boolean,
    quizResults: Array<object>,
    numQuizScore: number,
}