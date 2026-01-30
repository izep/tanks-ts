import struct

def test_term(filename, term_seq, start_offset, expected_cols):
    with open(filename, 'rb') as f:
        data = f.read()

    print(f"Testing {filename} with terminator {term_seq.hex()}")
    ptr = start_offset
    cols = 0
    
    while ptr < len(data) and cols < expected_cols + 10:
        # Scan for terminator
        found = False
        scan = ptr
        while scan <= len(data) - len(term_seq):
            if data[scan:scan+len(term_seq)] == term_seq:
                found = True
                # Found it
                # Len = scan - ptr
                ptr = scan + len(term_seq)
                cols += 1
                break
            scan += 1
        
        if not found:
            print(f"Terminator not found after offset {ptr}")
            break
            
    print(f"Total Columns Found: {cols}")
    print(f"Final Offset: {ptr}/{len(data)}")
    if cols == expected_cols:
        print("SUCCESS! Column count matches width.")
    elif cols > expected_cols:
         print("Over-count (Terminator too frequent?)")
    else:
         print("Under-count (Terminator missing?)")

# ROCK001 Width 681. Offset 75.
# MTTEST Width 512. Offset 74.

# Test 00 00
test_term('mtn/ROCK001.MTN', b'\x00\x00', 75, 681)
test_term('mtn/ROCK001.MTN', b'\x00\x00\x00', 75, 681)
test_term('mtn/ROCK001.MTN', b'\xFF\xFF', 75, 681)
test_term('mtn/ROCK001.MTN', b'\x80', 75, 681) # Maybe byte with high bit?
test_term('mtn/ICE001.MTN', b'\x00\x00', 75, 1024) # ICE001 checks out with 00 00?

