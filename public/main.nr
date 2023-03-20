use dep::std;

fn main(coords : [Field; 2], solutionHash : pub Field) {
    let hash = std::hash::pedersen(coords);
    constrain hash[0] == solutionHash;
}
