import os
import pandas as pd

def update_picture_dates(starting_path):
    base_dir = os.path.normpath("../public")  # Normalize to handle slashes correctly

    # Loop over each folder in starting_path (data/level_one)
    for folder in os.listdir(starting_path):
        folder_path = os.path.join(starting_path, folder)
        if os.path.isdir(folder_path):
            for folder2 in os.listdir(folder_path):
                folder_path2 = os.path.join(folder_path, folder2)
                if os.path.isdir(folder_path2):
                    # Define the target directory path
                    pictures_dir = os.path.join(folder_path2, "survey_data", "pictures")
                    if os.path.exists(pictures_dir):
                        # Define the Excel file path
                        excel_file = os.path.join(pictures_dir, "picture_dates.xlsx")
                        
                        df = pd.DataFrame(columns=["No.", "Date", "Path"])
                        
                        # For every folder (assumed to represent a date) in pictures_dir:
                        for subfolder in os.listdir(pictures_dir):
                            subfolder_path = os.path.join(pictures_dir, subfolder)
                            if os.path.isdir(subfolder_path):
                                # Iterate over each file in the subfolder
                                for file in os.listdir(subfolder_path):
                                    file_path = os.path.join(subfolder_path, file)
                                    if os.path.isfile(file_path):
                                        # Get relative path and remove "public/" prefix
                                        rel_path = os.path.relpath(file_path, base_dir).replace("\\", "/")
                                        rel_path = rel_path.lstrip("public/")  # Remove 'public/' prefix

                                        # Create a new row
                                        new_row = {
                                            "No.": len(df) + 1,
                                            "Date": subfolder,
                                            "Path": rel_path
                                        }
                                        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
                        
                        # Write the updated DataFrame back to the Excel file
                        df.to_excel(excel_file, index=False)
                        print(f"Updated {excel_file}")

if __name__ == "__main__":
    starting_path = "../public/data/special"
    update_picture_dates(starting_path)
