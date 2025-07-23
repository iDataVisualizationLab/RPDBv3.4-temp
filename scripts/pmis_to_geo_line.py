import pandas as pd
import numpy as np
from scipy.interpolate import interp1d
import geopandas as gpd
from shapely.geometry import LineString
import os
from tqdm import tqdm  # Add this to your imports

# Create output directories if they don't exist
os.makedirs("checked", exist_ok=True)
os.makedirs("results", exist_ok=True)

# --- Load data ---
pmis_path = 'data/PMIS_new.csv'
gps_path = 'data/TxDOT_Reference_Markers.xlsx'

df_pmis = pd.read_csv(pmis_path)
df_gps = pd.read_excel(gps_path, sheet_name='TxDOT_Reference_Markers_0')

# --- Normalize GPS data ---
df_gps['MRKR_NBR'] = pd.to_numeric(df_gps['MRKR_NBR'], errors='coerce')
df_gps = df_gps.dropna(subset=['RTE_NM', 'MRKR_NBR', 'x', 'y'])


# Dictionary: route_name → DataFrame with MRKR_NBR, x, y
gps_interp_data = {}

for rte, group in df_gps.groupby('RTE_NM'):
    group = group[['MRKR_NBR', 'x', 'y']].dropna()
    group = group.drop_duplicates(subset=['MRKR_NBR'])  # optional, or keep first
    group['MRKR_NBR'] = group['MRKR_NBR'].astype(float)
    gps_interp_data[rte] = group.sort_values('MRKR_NBR')

gps_interp_data = {
    rte: group[['MRKR_NBR', 'x', 'y']].dropna(subset=['MRKR_NBR', 'x', 'y']).copy()
    for rte, group in df_gps.groupby('RTE_NM')
}
for rte, gps_df in gps_interp_data.items():
    print(f"Route: {rte} | Columns: {gps_df.columns.tolist()}")
    break  # just show the first one
# --- Function to get interpolated GPS for (marker + offset) ---
def old_get_coords(rte, marker, offset):
    if pd.isna(marker) or pd.isna(offset):
        return np.nan, np.nan

    position = marker + offset

    if rte not in gps_interp_data:
        return np.nan, np.nan

    gps_df = gps_interp_data[rte]

    floor_marker = int(np.floor(position))
    ceil_marker = floor_marker + 1
    frac = position - floor_marker

    pt1 = gps_df[gps_df['MRKR_NBR'] == floor_marker]
    pt2 = gps_df[gps_df['MRKR_NBR'] == ceil_marker]
    # print(f"Route: {rte}, Floor: {floor_marker}, Ceil: {ceil_marker}, Frac: {frac}")
    # print(gps_df['MRKR_NBR'].unique())
    # print(f"PT1: {pt1}, PT2: {pt2}")
    x1, y1 = pt1[['x', 'y']].values[0] if not pt1.empty else (np.nan, np.nan)
    x2, y2 = pt2[['x', 'y']].values[0] if not pt2.empty else (np.nan, np.nan)

    x = x1 + (x2 - x1) * frac
    y = y1 + (y2 - y1) * frac

    return x, y

def get_coords(rte, marker, offset):
    if pd.isna(marker) or pd.isna(offset):
        return np.nan, np.nan

    position = marker + offset

    # make sure we have GPS data for this route
    if rte not in gps_interp_data:
        return np.nan, np.nan

    gps_df = gps_interp_data[rte]
    if gps_df.empty:
        return np.nan, np.nan

    # what markers actually exist?
    min_m, max_m = gps_df['MRKR_NBR'].min(), gps_df['MRKR_NBR'].max()
    # if our desired position is completely outside your markers, bail out
    if position < min_m or position > max_m:
        return np.nan, np.nan

    # start with the integer floor/ceil…
    floor_m = int(np.floor(position))
    ceil_m  = int(np.ceil(position))

    # but if that marker isn’t in your df, step outwards until you find one
    # (or hit the bounds)
    while floor_m not in gps_df['MRKR_NBR'].values and floor_m > min_m:
        floor_m -= 1
    while ceil_m not in gps_df['MRKR_NBR'].values and ceil_m < max_m:
        ceil_m += 1

    # if still missing, give up
    if floor_m not in gps_df['MRKR_NBR'].values or ceil_m not in gps_df['MRKR_NBR'].values:
        return np.nan, np.nan

    # grab the points
    pt1 = gps_df.loc[gps_df['MRKR_NBR'] == floor_m, ['x','y']].iloc[0]
    pt2 = gps_df.loc[gps_df['MRKR_NBR'] == ceil_m,  ['x','y']].iloc[0]

    # re‐compute fraction over the actual marker span
    span = ceil_m - floor_m
    frac = (position - floor_m) / span if span != 0 else 0.0

    x = pt1.x + (pt2.x - pt1.x) * frac
    y = pt1.y + (pt2.y - pt1.y) * frac

    return x, y


print(get_coords("FM0151-KG", 222, 1.4))


# --- Prepare PMIS fields ---
df_pmis['TX_BEG_REF_MARKER_NBR'] = pd.to_numeric(df_pmis['TX_BEG_REF_MARKER_NBR'], errors='coerce')
df_pmis['TX_BEG_REF_MRKR_DISP'] = pd.to_numeric(df_pmis['TX_BEG_REF_MRKR_DISP'], errors='coerce')
df_pmis['TX_END_REF_MARKER_NBR'] = pd.to_numeric(df_pmis['TX_END_REF_MARKER_NBR'], errors='coerce')
df_pmis['TX_END_REF_MARKER_DISP'] = pd.to_numeric(df_pmis['TX_END_REF_MARKER_DISP'], errors='coerce')

# df_pmis['TX_SIGNED_HIGHWAY_RDBD_ID'] = df_pmis['TX_SIGNED_HIGHWAY_RDBD_ID'].str.strip().str.upper()
df_pmis['TX_SIGNED_HIGHWAY_RDBD_ID'] = df_pmis['TX_SIGNED_HIGHWAY_RDBD_ID'].str.replace(' ', '-') + 'G'

# Add a progress indicator
tqdm.pandas()

# --- Interpolate start and end GPS ---
print("Calculating start coordinates...")
start_coords = df_pmis.progress_apply(lambda row: get_coords(
    row['TX_SIGNED_HIGHWAY_RDBD_ID'],
    row['TX_BEG_REF_MARKER_NBR'],
    row['TX_BEG_REF_MRKR_DISP']
), axis=1)

print("Calculating end coordinates...")
end_coords = tqdm(df_pmis.apply(lambda row: get_coords(
    row['TX_SIGNED_HIGHWAY_RDBD_ID'],
    row['TX_END_REF_MARKER_NBR'],
    row['TX_END_REF_MARKER_DISP']
), axis=1), total=len(df_pmis))

df_pmis['start_lon'], df_pmis['start_lat'] = zip(*start_coords)
df_pmis['end_lon'], df_pmis['end_lat'] = zip(*end_coords)


# =========================================
df_pmis.to_csv("checked/pmis_before.csv", index=False)
# --- Drop rows where interpolation failed ---
df_pmis.dropna(subset=['start_lon', 'start_lat', 'end_lon', 'end_lat'], inplace=True)
df_pmis.to_csv("checked/pmis_after.csv", index=False)
# =========================================


# --- Create LineString geometries ---
df_pmis['geometry'] = df_pmis.apply(lambda row: LineString([
    (row['start_lon'], row['start_lat']),
    (row['end_lon'], row['end_lat'])
]), axis=1)

# --- Convert to GeoDataFrame ---
gdf = gpd.GeoDataFrame(df_pmis, geometry='geometry', crs="EPSG:4326")

# --- Filter to latest EFF_YEAR per full-offset-defined section ---
df_pmis['TX_BEG_FULL_DIST'] = df_pmis['TX_BEG_REF_MARKER_NBR'] + df_pmis['TX_BEG_REF_MRKR_DISP']
df_pmis['TX_END_FULL_DIST'] = df_pmis['TX_END_REF_MARKER_NBR'] + df_pmis['TX_END_REF_MARKER_DISP']

latest_df = df_pmis.sort_values(
    by=['TX_SIGNED_HIGHWAY_RDBD_ID', 'TX_BEG_FULL_DIST', 'TX_END_FULL_DIST', 'EFF_YEAR'],
    ascending=[True, True, True, False]
).drop_duplicates(
    subset=['TX_SIGNED_HIGHWAY_RDBD_ID', 'TX_BEG_FULL_DIST', 'TX_END_FULL_DIST'],
    keep='first'
)

latest_gdf = gpd.GeoDataFrame(latest_df, geometry='geometry', crs="EPSG:4326")
full_gdf = gpd.GeoDataFrame(df_pmis, geometry='geometry', crs="EPSG:4326")

# Define columns to remove
columns_to_remove = [
    "TX_IRI_LEFT_SCORE", "TX_IRI_RIGHT_SCORE", "TX_IRI_AVERAGE_SCORE",
    "TX_RTG_CYCLE_ID", "TX_VISUAL_LANE_CODE",
    "TX_JCP_APPARENT_JNT_SPACE_MEAS",
    "TX_TOTL_SURF_RDWAY_WIDTH_MEAS", "TX_ATHWLD_100_LBS",
    "TX_SPEED_LIMIT_MAX", "TX_NUMBER_THRU_LANES", "TX_CURRENT_18KIP_MEAS"
]

# Remove unwanted columns from the DataFrames
removed_from_latest = []
removed_from_full = []

for col in columns_to_remove:
    if col in latest_df.columns:
        latest_df = latest_df.drop(columns=[col])
        latest_gdf = latest_gdf.drop(columns=[col])
        removed_from_latest.append(col)
    
    if col in df_pmis.columns:
        df_pmis = df_pmis.drop(columns=[col])
        full_gdf = full_gdf.drop(columns=[col])
        removed_from_full.append(col)

# Log what was removed
if removed_from_latest:
    print(f"Removed {len(removed_from_latest)} columns from latest data: {', '.join(removed_from_latest)}")
if removed_from_full:
    print(f"Removed {len(removed_from_full)} columns from full data: {', '.join(removed_from_full)}")

# --- Export ---
latest_gdf.to_file("results/pmis_lines_latest.geojson", driver="GeoJSON")
full_gdf.to_file("results/pmis_data_latest.geojson", driver="GeoJSON")

latest_df.to_csv("results/pmis_lines_latest.csv", index=False)
df_pmis.to_csv("results/pmis_data_latest.csv", index=False)

print("✅ Interpolated and saved GeoJSON and CSV files for PMIS lines.")
