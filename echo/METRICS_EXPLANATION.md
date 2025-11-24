# Metrics "Not Available" Explanation

## What It Means

When the Insights tab shows **"Metrics: Not Available"**, it means:

- ✅ **Telemetry Available**: You have loaded telemetry data (from dataset or upload)
- ✅ **Predictions Available**: Predictions have been computed from the telemetry
- ❌ **Metrics Not Available**: Behavior metrics haven't been computed yet

## Why Metrics Aren't Available

**Metrics** are computed by the `BehaviorScorecard` component, which:
1. Takes telemetry data
2. Calls `/api/metrics` to compute driver behavior metrics
3. Returns scores for: smoothness, consistency, corner handling, aggressiveness

**The Issue**: The `BehaviorScorecard` component needs to be rendered to compute metrics. It's now included in the **Analysis** tab.

## How to Get Metrics Available

### Option 1: Visit the Analysis Tab (Recommended)
1. Load data in the **Predictions** tab
2. Go to the **Analysis** tab
3. The `BehaviorScorecard` component will automatically compute metrics
4. Metrics will now show as "Available" in the Insights tab

### Option 2: Automatic Computation (Current Setup)
- Metrics are now computed automatically when you visit the Analysis tab
- Once computed, they're available in the Insights tab

## What Metrics Include

When computed, metrics provide:
- **Cornering Aggression**: How aggressively the driver takes corners
- **Braking Intensity**: How hard the driver brakes
- **Throttle Consistency**: How consistent throttle usage is
- **Speed Consistency**: How consistent speed is maintained
- **Overall Rating**: Combined score

These metrics help Gemini provide better insights about driver behavior.

## Current Status

✅ **Fixed**: `BehaviorScorecard` is now included in the Analysis tab
✅ **Fixed**: Metrics are automatically computed when data is loaded
✅ **Fixed**: Metrics are passed to the Insights tab

## Testing

1. Load data in Predictions tab
2. Go to Analysis tab (metrics will compute automatically)
3. Go to Insights tab
4. You should now see: "Metrics: Available" ✅

