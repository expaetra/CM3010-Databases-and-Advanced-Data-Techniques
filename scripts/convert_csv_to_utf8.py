## Helper that converts CSV file from CP-1250 to UTF-8 encoding
import io
import os 

def convert_csv_to_utf8(input_path, output_path): 
  
    # Check if file exists & skip 
    if os.path.exists(output_path): 
        return

    # Read the original file
    with io.open(input_path, "r", encoding="cp1250",newline="") as f: 
        text = f.read()

    # Write the eoncoded file
    with io.open(output_path, "w", encoding="utf-8", newline="") as f:
        f.write(text) 

