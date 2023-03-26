use dep::std;

fn main(solution : [u8; 32], solutionHash : pub [u8; 32]) -> pub bool {
    let hash = std::hash::sha256(solution);
    constrain hash == solutionHash;
    hash == solutionHash
}

#[test]
fn test() {
    let solutionHash = [
        162, 107,  10, 155,  19, 193, 232,
        106, 148, 202, 173, 142,  37, 207,
        177, 119, 218, 192, 200, 240, 191,
        156,  89, 184, 142,  18,  27, 253,
        222,  98,  42,  68
    ];
    let solution = [ 
        123, 189, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0 
    ];
    constrain main(solution, solutionHash) == true;

}
