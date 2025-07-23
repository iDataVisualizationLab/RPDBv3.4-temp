import os
import argparse
import pandas as pd
import json

# Set up argument parser
parser = argparse.ArgumentParser()
parser.add_argument("--env", choices=["dev", "production"], default="dev", help="Set environment (dev or production)")
args = parser.parse_args()

# Define root directory based on the environment
root_dir = "../public/data" if args.env == "dev" else "public/data"

print(f"Running in {args.env} mode. Using root_dir: {root_dir}")

# Traverse directories and convert all .xlsx files to .json
for dirpath, _, filenames in os.walk(root_dir):
    for file in filenames:
        if file.endswith(".xlsx"):
            file_path = os.path.join(dirpath, file)
            json_output_path = os.path.join(dirpath, file.replace(".xlsx", ".json"))

            # Read the Excel file
            excel_file = pd.ExcelFile(file_path)
            if 'Deflection' in excel_file.sheet_names and 'LTE' in excel_file.sheet_names:
                surveysData = {}
                sheetsToProcess = ['Deflection', 'LTE']
                
                for sheet_name in sheetsToProcess:
                    worksheet = excel_file.parse(sheet_name)  # Parse the specified sheet
                    worksheet.fillna('', inplace=True)  # Replace NaN with an empty string
                    surveysData[sheet_name] = worksheet.to_dict(orient="records")  # Store as a list of dictionaries
                
                # Write the combined JSON data to a file
                with open(json_output_path, "w", encoding="utf-8") as json_file:
                    json.dump(surveysData, json_file, indent=4)  # Write as JSON objects
            else:
                df = pd.read_excel(file_path)
                # Convert to JSON
                json_data = df.to_json(orient="records", indent=4)
                # Fill NaN values with an empty string or a placeholder value
                df.fillna('', inplace=True)  # Replace NaN with an empty string
                # Write to JSON file
                with open(json_output_path, "w", encoding="utf-8") as json_file:
                    json_file.write(json_data)

            print(f"Converted {file_path} to {json_output_path} successfully!")
