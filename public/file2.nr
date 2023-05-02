use dep::std;

fn doStuff(x : Field, y : Field) -> bool {
    constrain x == y;
    x == y
}
