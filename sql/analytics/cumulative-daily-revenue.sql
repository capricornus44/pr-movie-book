WITH DailySales AS (
    SELECT
        DATE_TRUNC('day', b."createdAt") AS sales_date,
        SUM(b."totalPrice") AS daily_revenue
    FROM "Booking" b
    WHERE b.status = 'CONFIRMED'
    GROUP BY DATE_TRUNC('day', b."createdAt")
)
SELECT
    sales_date::date,
    daily_revenue,
    SUM(daily_revenue) OVER (ORDER BY sales_date ASC) AS running_total_revenue
FROM DailySales
ORDER BY sales_date ASC;
