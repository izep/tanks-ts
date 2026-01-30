import struct
import os

def brute_force():
    files = {
        'mtn/ROCK001.MTN': 681,
        'mtn/ICE001.MTN': 1024, # Need actual width. Header bytes 6,7
        'mtn/SNOW001.MTN': 1024,
        'mtn/MTTEST.MTN': 512
    }
    
    # Get actual widths
    for f in files:
         with open(f, 'rb') as fh:
             head = fh.read(18)
             w = head[6] | (head[7] << 8)
             files[f] = w
             print(f"{f} Width: {w} Size: {os.path.getsize(f)}")

    for fname, width in files.items():
        if fname != 'mtn/ROCK001.MTN': continue 
        # Focus on ROCK001

        with open(fname, 'rb') as fh:
            data = fh.read()
            
        print(f"Scanning {fname} (W={width})...")
        
        # Try offsets 0 to 100
        for start in range(50, 100):
            # Mode 1: Height Byte -> Pixels
            ptr = start
            cols = 0
            valid = True
            
            while ptr < len(data) and cols < width:
                h = data[ptr]
                ptr += 1 # Consume height byte
                
                # Payload: ceil(h/2)
                pay = (h + 1) // 2
                ptr += pay
                cols += 1
            
            if cols == width and ptr == len(data):
                print(f"MATCH MODE 1 (H=Pix)! Offset {start}")
            
            # Mode 2: Height Byte -> Bytes
            ptr = start
            cols = 0
            while ptr < len(data) and cols < width:
                h = data[ptr]
                if h == 0: 
                    # If h is 0, length 0?
                    ptr += 1
                else:
                    ptr += 1 + h
                cols += 1
                
            if cols == width and ptr == len(data):
                 print(f"MATCH MODE 2 (H=Bytes)! Offset {start}")

            # Mode 3: 0x00 Terminated (My current logic)
            # Count columns.
            ptr = start
            cols = 0
            while ptr < len(data) and cols < width:
                # Scan for 00
                while ptr < len(data) and data[ptr] != 0:
                    ptr += 1
                ptr += 1 # skip 00
                cols += 1
            
            if cols == width and ptr == len(data):
                 print(f"MATCH MODE 3 (00 Term)! Offset {start}")

brute_force()
