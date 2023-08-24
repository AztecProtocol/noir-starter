fn main(x : u52) {
    let mut z = x; 
    for i in 0..5000{
        z = z + 1;
        assert(z > x);
    }
}