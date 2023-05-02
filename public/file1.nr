mod file2;

fn main(x : Field, y : pub Field) -> pub bool {
    file2::doStuff(x, y)
}

#[test]
fn test() {
    constrain main(1, 1) == true;
    constrain main(2, 2) == true;
}
