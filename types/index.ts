export type Puzzle = {
    url: string,
    solutionHash: string,
}

export type Captcha = {
    key: string, 
    solutionHash: number[]
}
