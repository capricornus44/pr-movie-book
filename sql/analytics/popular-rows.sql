WITH RowStats AS (
    SELECT
        h.name AS hall_name,
        st.row AS row_name,
        COUNT(st.id) AS tickets_sold
    FROM "_BookingToSeat" bs
    JOIN "Booking" b ON bs."A" = b.id
    JOIN "Seat" st ON bs."B" = st.id
    JOIN "Hall" h ON st."hallId" = h.id
    WHERE b.status = 'CONFIRMED'
    GROUP BY h.name, st.row
)
SELECT
    hall_name,
    row_name,
    tickets_sold,
    RANK() OVER (PARTITION BY hall_name ORDER BY tickets_sold DESC) AS popularity_rank_in_hall
FROM RowStats
ORDER BY hall_name, popularity_rank_in_hall;
