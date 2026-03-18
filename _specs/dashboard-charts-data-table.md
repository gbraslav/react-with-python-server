# Spec for dashboard-charts-data-table

branch: claude/feature/dashboard-charts-data-table

## Summary
A dashboard page that fetches data from a single REST API endpoint and presents it in two parts: a paginated data table at the top, followed by four charts (line, bar, and venn diagram) arranged in a 2x2 grid. The page uses a white theme with color charts.

## Functional Requirements
- Fetch all data from the Flask REST API via a single API call to one endpoint
- Display a data table above the charts showing all records from the response
  - Table paginates with a fixed page size of 10 rows per page
  - Table shows all fields from the data
- Display 4 charts in a 2x2 grid layout below the table:
  - Chart 1 (top-left): Line chart representing one numeric field over the dataset
  - Chart 2 (top-right): Bar chart representing a second numeric field
  - Chart 3 (bottom-left): A second line or bar chart representing a third numeric field
  - Chart 4 (bottom-right): Venn diagram representing overlap between two numeric fields or categories
- All charts must use distinct colors
- Page background and theme is white
- All chart and table data comes from the same API response (no separate calls)

## Possible Edge Cases
- API returns an empty dataset — table shows "No data" and charts render empty states gracefully
- API call fails — show an error message in place of the table and charts
- Dataset has fewer than 10 rows — pagination controls are hidden or disabled
- Numeric fields contain null or undefined values — charts and table handle missing values without crashing
- Very large datasets — pagination prevents rendering all rows at once; charts use the full dataset

## Acceptance Criteria
- Page loads and makes exactly one API call to retrieve data
- Data table renders at the top of the page with correct values from the API response
- Table paginates correctly: page size is 10, navigation moves between pages
- Four charts render in a 2x2 grid below the table
- Charts include: at least one line chart, at least one bar chart, and one venn diagram
- Each chart displays data from a different numeric field in the dataset
- All charts use color (not monochrome)
- Page has a white background theme
- Empty and error states are handled and displayed to the user

## Open Questions
- Which specific numeric fields from the data table should map to which chart? call them data_field1,data_field2,data_field3,data_field4 
- What is the Flask API endpoint path and response shape? GetChartData
- Should the venn diagram compare two numeric fields by threshold, or two categorical fields by membership? 2 fields, field1 and field2
- Should the table support sorting or filtering, or is it read-only? no
- Should chart data reflect the current page of the table, or always the full dataset? current page

# Testing Guidelines
Create a test file(s) in the `./test` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- API fetch is called once on page load
- Table renders the correct number of rows (up to 10) per page
- Pagination controls navigate between pages correctly
- All four charts render without crashing given valid data
- Error state is shown when the API call fails
- Empty state is shown when the API returns no data
