-- Maaz Tanveer Project 6: NYCFlights13 Database
-- Tools: DBeaver + SQLite


--️ all flights that departed on January 1, 2013
select *
from flights 
where year = 2013 AND month = 1 AND day = 1;

-- finding distinct airlines in database
select distinct name
from airlines
order by name;

-- display all airport names in nyc
select name, faa 
from airports 
where faa IN ('JFK', 'LGA') -- over here
order by faa;

-- total num of flights
select COUNT(*) as total_flights -- aggregate function count
from flights;

-- flights with arrival delay > 60 mins
select *
from flights
where arr_delay > 60;

--cancelled flights
select * 
from flights
where dep_time IS NULL; -- if no departure time then flight did not take off hence cancelled

-- 10 earliest departing flights
-- exclude null dep_time then sort ascending and take first 10
select *
from flights
where dep_time is not null
order by dep_time asc
limit 10;

-- ave air time of flights departing from jfk
select origin, AVG(air_time) as avg_air_time_minutes
from flights
where origin = 'JFK' AND air_time is not null
group by origin;

-- flights with a departure delay but no arrival delay
-- no arrival delay = exactly zero minutes late
select *
from flights
where dep_delay > 0 AND arr_delay = 0;

-- retrieve all flights headed to los angeles lax
select *
from flights
where dest = 'LAX';

-- find the airline with the most flights
-- join flights to airlines then group and sort
select a.name, COUNT(*) as flight_count
from flights f join airlines a on a.carrier = f.carrier
group by a.name
order by flight_count desc
limit 1;

-- calculate the average departure delay for each airport of origin
-- group by origin to aggregate per airport
select origin, AVG(dep_delay) as avg_dep_delay
from flights
where dep_delay is not null
group by origin
order by avg_dep_delay desc;

-- list the top 5 destinations by the number of flights
-- aggregate first then join to look up airport name when available
select t.dest, ap.name as dest_name, t.flights_to_dest
from (
    select dest, COUNT(*) as flights_to_dest
    from flights
    group by dest
) t
left join airports ap on ap.faa = t.dest
order by t.flights_to_dest desc
limit 5;

-- retrieve the names of airlines that had flights to chicago ord
-- distinct airline names after filtering dest
select distinct a.name
from flights f join airlines a on a.carrier = f.carrier
where f.dest = 'ORD'
order by a.name;

-- find the total number of flights delayed by more than 30 minutes for each carrier
select a.name, COUNT(*) as delayed_over_30
from flights f join airlines a on a.carrier = f.carrier
where f.dep_delay > 30
group by a.name
order by delayed_over_30 desc;

-- calculate the average flight speed using distance and air_time
-- convert minutes to hours to get mph and avoid integer division with 1.0
select AVG(1.0 * 60 * distance / air_time) as avg_mph
from flights
where distance is not null AND air_time is not null AND air_time > 0;

-- find the maximum arrival delay for each destination
-- group by dest and take the maximum delay
select dest, MAX(arr_delay) as max_arr_delay
from flights
where arr_delay is not null
group by dest
order by max_arr_delay desc;

-- list all flights that were delayed at departure but arrived early or on time
-- early or on time means arr_delay less than or equal to zero
select *
from flights
where dep_delay > 0 AND arr_delay <= 0;

--  the name of the airline with the longest average flight time
-- average air_time per airline then pick the top one
select a.name, AVG(f.air_time) as avg_air_time_minutes
from flights f
join airlines a on a.carrier = f.carrier
where f.air_time is not null
group by a.name
order by avg_air_time_minutes desc
limit 1;

-- find the top 10 flights that have the longest distance traveled
-- show key identifiers and sort by distance descending
select year, month, day, carrier, flight, origin, dest, distance
from flights
where distance is not null
order by distance desc
limit 10;

-- for each month calculate the total number of flights and the average departure delay
-- group by month to aggregate totals and averages
select month, COUNT(*) as flights_in_month, AVG(dep_delay) as avg_dep_delay
from flights
group by month
order by month;

-- find the top 3 days with the most flights departing from jfk
-- group by month and day to count departures on each calendar day
select month, day, COUNT(*) as jfk_departures
from flights
where origin = 'JFK'
group by month, day
order by jfk_departures desc
limit 3;

-- calculate the average delay for each hour of departure
-- exclude canceled flights and nulls then group by hour
select hour as dep_hour, AVG(dep_delay) as avg_dep_delay
from flights
where dep_time is not null AND dep_delay is not null AND hour is not null
group by dep_hour
order by dep_hour;


-- identify the top 5 most popular routes by origin and destination pair
-- group by route then sort by flight count
select origin, dest, COUNT(*) as flights_on_route
from flights
group by origin, dest
order by flights_on_route desc
limit 5;

-- find the airline with the highest average departure delay
-- average dep_delay per airline then pick the worst performer
select a.name, AVG(f.dep_delay) as avg_dep_delay
from flights f join airlines a on a.carrier = f.carrier
where f.dep_delay is not null
group by a.name
order by avg_dep_delay desc
limit 1;

-- find the top 5 airport pairs with the longest average flight distance
-- average distance by route then sort descending
select f.origin, f.dest, AVG(f.distance) as avg_distance
from flights f
group by f.origin, f.dest
order by avg_distance desc
limit 5;

-- find all flights delayed at both departure and arrival but with air time less than 3 hours
-- air_time is in minutes so 180 equals 3 hours
select *
from flights
where dep_delay > 0 AND arr_delay > 0 AND air_time is not null AND air_time < 180;








