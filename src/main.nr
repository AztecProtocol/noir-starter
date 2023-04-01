use dep::std;

fn main(x : Field, y : pub Field) -> pub bool {
    constrain x == y;
    x == y
}

#[test]
fn test() {
    constrain main(1, 1) == true;
    constrain main(2, 2) == true;
}
