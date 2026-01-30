import struct

def hex_bytes(data):
    return ' '.join(f'{b:02X}' for b in data)

def compare_headers():
    files = ['mtn/SNOW001.MTN', 'mtn/SNOW003.MTN', 'mtn/ROCK001.MTN', 'mtn/ICE001.MTN']
    
    for fname in files:
        print(f"\n--- {fname} ---")
        try:
            with open(fname, 'rb') as f:
                data = f.read()
            
            # Find FF FF FF
            marker = data.find(b'\xFF\xFF\xFF')
            print(f"File Size: {len(data)}")
            print(f"Marker FF FF FF at: {marker}")
            
            if marker >= 0:
                after = data[marker+3:marker+3+60]
                print(f"Bytes after marker: {hex_bytes(after)}")
                
                # Check for Palette-like structure (00-3F or 00-FF values, usually smooth)
                # ROCK001 bytes after marker: A5 9C 8C DE ... (High values!)
                # ICE001 bytes after marker: 00 00 00 ... (Palette-like)
                
                # Check SNOW003 (Good)
                # Check SNOW001 (Bad)
        except Exception as e:
            print(f"Error: {e}")

compare_headers()
