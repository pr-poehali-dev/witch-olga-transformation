import json
import os
import urllib.request
import urllib.parse
import psycopg2


def handler(event: dict, context) -> dict:
    """Принимает отзыв от клиента, сохраняет в БД и отправляет на модерацию в Telegram"""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body", "{}"))
    name = body.get("name", "Клиентка").strip() or "Клиентка"
    text = body.get("text", "").strip()
    stars = int(body.get("stars", 5))

    if not text:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Текст отзыва обязателен"}),
        }

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO reviews (name, text, stars, approved) VALUES (%s, %s, %s, FALSE) RETURNING id",
        (name, text, stars),
    )
    review_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]

    stars_str = "⭐" * stars
    approve_text = (
        f"✍️ Новый отзыв на модерацию!\n\n"
        f"👤 Имя: {name}\n"
        f"{stars_str}\n\n"
        f"💬 {text}\n\n"
        f"ID отзыва: {review_id}\n"
        f"Для одобрения отправь команду: /approve_{review_id}"
    )

    tg_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    tg_payload = json.dumps({
        "chat_id": chat_id,
        "text": approve_text,
    }).encode()

    req = urllib.request.Request(tg_url, data=tg_payload, method="POST", headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req)

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"success": True}),
    }