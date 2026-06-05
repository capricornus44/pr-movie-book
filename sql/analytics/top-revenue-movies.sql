WITH MovieRevenue AS (
    SELECT
        s."movieId" AS movie_id,
        SUM(b."totalPrice") AS total_revenue,
        COUNT(b.id) AS total_bookings
    FROM "Booking" b
    JOIN "Showtime" s ON b."showtimeId" = s.id
    WHERE b.status = 'CONFIRMED'
    GROUP BY s."movieId"
)
SELECT
    movie_id,
    total_revenue,
    total_bookings,
    DENSE_RANK() OVER (ORDER BY total_revenue DESC) AS revenue_rank
FROM MovieRevenue;
