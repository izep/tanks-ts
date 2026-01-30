import os

def check_file(path, start_offset):
    try:
        with open(path, 'rb') as f:
            data = f.read()
    except:
        return

    print(f"\n--- {path} ---")
    print(f"Size: {len(data)}")
    print(f"Start Offset: {start_offset}")
    
    # Mode 1: Height is Pixels (Packed bytes)
    ptr = start_offset
    cols = 0
    max_cols = 1200
    
    valid = True
    while ptr < len(data) and cols < max_cols:
        height = data[ptr]
        if height == 0:
            # Maybe height 0 is valid? 0 pixels.
            # Next byte is next height.
            ptr += 1
        else:
            # Packed nibbles
            bytes_needed = (height + 1) // 2
            ptr += 1 + bytes_needed
        
        cols += 1
        
    print(f"[Mode 1: H=Pix] Cols found: {cols}. Ptr: {ptr}/{len(data)}")
    
    # Mode 2: Height is Bytes
    ptr = start_offset
    cols = 0
    while ptr < len(data) and cols < max_cols:
        height = data[ptr]
        ptr += 1 + height
        cols += 1
        
    print(f"[Mode 2: H=Bytes] Cols found: {cols}. Ptr: {ptr}/{len(data)}")

check_file('mtn/ROCK001.MTN', 75)
check_file('mtn/ICE001.MTN', 75)
check_file('mtn/SNOW001.MTN', 75)
check_file('mtn/MTTEST.MTN', 74)
