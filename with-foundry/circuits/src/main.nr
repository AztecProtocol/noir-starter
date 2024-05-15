fn main(x: Field, y: pub Field) -> pub Field {
    assert(x == y);
    y
}

#[export]
fn exported() -> Field {
    3
}
