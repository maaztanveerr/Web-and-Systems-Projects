# NYC Flights SQL Exploration (nycflights13)

This project explores the **nycflights13** relational database using SQL. I wrote a set of queries to extract, filter, join, and aggregate real flight data from New York City airports in 2013. The focus was building confidence with both SQL fundamentals and common analytics patterns like grouping, joining, and computing derived metrics.

## What I Built
- A complete SQL script, `nycQueries.sql`, that answers a structured set of questions about flights, airports, airlines, and delays
- Queries covering:
  - Filtering by date, destination, cancellations, and delay thresholds
  - Sorting and limiting for "top N" style analysis
  - Aggregations like `COUNT`, `AVG`, `MAX`
  - Group-based analysis with `GROUP BY`
  - Joins to map carrier codes to airline names and airport codes to airport names
  - A derived metric for average flight speed using `distance` and `air_time`

## Tech Used
- SQL
- DBeaver
- SQLite

## Dataset Overview
The database is the `nycflights13` dataset, which includes tables like:
- `flights`: departure and arrival info, delays, distance, origin, destination, carrier, and more
- `airlines`: carrier codes mapped to airline names
- `airports`: airport metadata including FAA code and airport name

## Highlights of the Analysis
Here are a few examples of what my queries retrieve:
- All flights departing on a specific date (January 1, 2013)
- The set of distinct airlines in the dataset
- Total number of flights
- Flights with heavy delays (arrival delay over 60 minutes)
- Canceled flights (identified by missing departure time)
- Earliest departing flights (top 10)
- Average air time for flights leaving JFK
- Most common destinations and most popular routes
- The airline with the most flights
- Average departure delay by origin airport
- Worst airline by average departure delay
- Longest flights by distance
- Monthly totals and average departure delays
- Delay patterns by hour of departure
- Flights delayed at both departure and arrival with air time under 3 hours

## How to Run
1. Open your database tool (I used DBeaver).
2. Connect to your SQLite database that contains the `nycflights13` tables.
3. Open `nycQueries.sql`.
4. Run the script to view outputs for each query.

## Files
- `nycQueries.sql`  
  The full set of SQL queries, with comments explaining the purpose of each query.

## Notes on Implementation
- I used `dep_time IS NULL` to flag cancellations because a missing departure time indicates the flight never took off.
- For average speed, I avoided divide-by-zero and null values by filtering for valid `air_time` and `distance`, and I used `1.0 * 60 * distance / air_time` to ensure floating-point math and convert minutes to hours.

## Possible Improvements
- Extend analysis using the `weather` table to see how conditions relate to delays
- Build a small dashboard using charts for delay trends by month and hour
- Create reusable views for common queries like routes, carrier performance, and airport performance