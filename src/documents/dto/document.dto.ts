export interface DocumentDto {
    userId: string,
    type: string, // blog, text, research paper, book
    name: string
}

export interface UpdateDto {
    id: string,
    levelsCompleted: Array<number>,
    quizTaken: boolean,
    quizResults: Array<object>,
    numQuizScore: number,
}