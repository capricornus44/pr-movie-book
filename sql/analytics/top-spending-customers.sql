SELECT
    b."userId" AS user_uuid,
    COUNT(DISTINCT b.id) AS confirmed_bookings_count,
    COUNT(bs."B") AS total_seats_bought,
    SUM(b."totalPrice") AS total_money_spent
FROM "Booking" b
JOIN "_BookingToSeat" bs ON bs."A" = b.id
WHERE b.status = 'CONFIRMED'
GROUP BY b."userId"
ORDER BY total_money_spent DESC
LIMIT 5;
