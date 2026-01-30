import struct

def analyze_rock():
    path = 'mtn/ROCK001.MTN'
    offset = 75
    
    with open(path, 'rb') as f:
        data = f.read()
    
    print(f"File Size: {len(data)}")
    print(f"Data starts at {offset}")
    
    ptr = offset
    cols = []
    
    # Simulate parsing
    # Limit to 700 columns (width is 681)
    
    col_offsets = []
    
    for i in range(681):
        start_ptr = ptr
        col_offsets.append(start_ptr)
        
        # Read until 0x00
        length = 0
        while ptr < len(data) and data[ptr] != 0x00:
            ptr += 1
            length += 1
        
        # Terminator
        if ptr < len(data):
            ptr += 1 # Skip 0x00
            
        cols.append((start_ptr, length))
        
        # Check reported columns
        if i in [227, 403, 458]:
            print(f"\n--- Column {i} ---")
            print(f"Start Offset: {start_ptr}")
            print(f"Length (bytes): {length}")
            print(f"Bytes: {data[start_ptr:start_ptr+min(20, length)].hex(' ')}")
            # Show bytes AFTER the terminator too, to see if we stopped early
            print(f"Bytes after terminator: {data[ptr:ptr+10].hex(' ')}")

    print(f"\nTotal columns parsed: {len(cols)}")
    print(f"Final Ptr: {ptr}")
    print(f"Leftover bytes: {len(data) - ptr}")

analyze_rock()
