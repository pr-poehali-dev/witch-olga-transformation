import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Одобряет отзыв по ID (вызывается через Telegram webhook) или возвращает список одобренных отзывов"""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    method = event.get("httpMethod", "GET")

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    if method == "GET":
        cur.execute(
            "SELECT id, name, text, stars, created_at FROM reviews WHERE approved = TRUE ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        reviews = [
            {"id": r[0], "name": r[1], "text": r[2], "stars": r[3], "created_at": str(r[4])}
            for r in rows
        ]
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"reviews": reviews}),
        }

    if method == "POST":
        body = json.loads(event.get("body", "{}"))

        # Telegram webhook: обрабатываем команду /approve_ID
        if "message" in body:
            msg_text = body["message"].get("text", "")
            if msg_text.startswith("/approve_"):
                review_id = int(msg_text.replace("/approve_", "").strip())
                cur.execute(
                    "UPDATE reviews SET approved = TRUE WHERE id = %s RETURNING id, name",
                    (review_id,),
                )
                row = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                if row:
                    return {
                        "statusCode": 200,
                        "headers": {"Access-Control-Allow-Origin": "*"},
                        "body": json.dumps({"success": True, "approved_id": row[0]}),
                    }

        # Прямой вызов с review_id
        review_id = body.get("review_id")
        if review_id:
            cur.execute(
                "UPDATE reviews SET approved = TRUE WHERE id = %s RETURNING id",
                (int(review_id),),
            )
            conn.commit()
            cur.close()
            conn.close()
            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"success": True}),
            }

    cur.close()
    conn.close()
    return {
        "statusCode": 400,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"error": "Bad request"}),
    }
