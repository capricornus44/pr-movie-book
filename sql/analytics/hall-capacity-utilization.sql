SELECT
    s.id AS showtime_id,
    h.name AS hall_name,
    s."startTime" AS showtime_start,
    h.capacity AS total_capacity,
    COUNT(bs."B") AS booked_seats_count,
    ROUND(
        (COUNT(bs."B")::float / h.capacity::float * 100)::numeric,
        2
    ) AS utilization_percentage
FROM "Showtime" s
JOIN "Hall" h ON s."hallId" = h.id
LEFT JOIN "Booking" b ON b."showtimeId" = s.id AND b.status = 'CONFIRMED'
LEFT JOIN "_BookingToSeat" bs ON bs."A" = b.id
GROUP BY s.id, h.name, s."startTime", h.capacity
ORDER BY utilization_percentage DESC;
