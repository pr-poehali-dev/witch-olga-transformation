import json
import os
import urllib.request
import psycopg2


def send_telegram(bot_token: str, chat_id: str, text: str):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text}).encode()
    req = urllib.request.Request(url, data=payload, method="POST", headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req)


def handler(event: dict, context) -> dict:
    """Одобряет/отклоняет отзыв по ID, возвращает список одобренных, настраивает webhook"""

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
    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    function_url = "https://functions.poehali.dev/5d715769-456a-46e3-ac53-6522470898af"

    # Установка webhook
    if method == "GET":
        params = event.get("queryStringParameters") or {}
        if params.get("setup_webhook") == "1":
            url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
            payload = json.dumps({"url": function_url}).encode()
            req = urllib.request.Request(url, data=payload, method="POST", headers={"Content-Type": "application/json"})
            resp = urllib.request.urlopen(req)
            result = json.loads(resp.read().decode())
            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps(result),
            }

        # Список одобренных отзывов
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
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

        # Telegram callback_query (нажатие inline-кнопки)
        if "callback_query" in body:
            cq = body["callback_query"]
            cq_id = cq["id"]
            cq_data = cq.get("data", "")
            from_chat_id = cq["message"]["chat"]["id"]

            conn = psycopg2.connect(os.environ["DATABASE_URL"])
            cur = conn.cursor()

            if cq_data.startswith("approve_"):
                review_id = int(cq_data.replace("approve_", ""))
                cur.execute(
                    "UPDATE reviews SET approved = TRUE WHERE id = %s RETURNING name",
                    (review_id,)
                )
                row = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                answer_text = f"✅ Отзыв #{review_id} от {row[0] if row else '?'} опубликован!" if row else "Отзыв не найден"

            elif cq_data.startswith("reject_"):
                review_id = int(cq_data.replace("reject_", ""))
                cur.execute("DELETE FROM reviews WHERE id = %s RETURNING name", (review_id,))
                row = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                answer_text = f"❌ Отзыв #{review_id} удалён" if row else "Отзыв не найден"
            else:
                cur.close()
                conn.close()
                answer_text = "Неизвестная команда"

            # Ответить на callback
            ack_url = f"https://api.telegram.org/bot{bot_token}/answerCallbackQuery"
            ack_payload = json.dumps({"callback_query_id": cq_id, "text": answer_text}).encode()
            ack_req = urllib.request.Request(ack_url, data=ack_payload, method="POST", headers={"Content-Type": "application/json"})
            urllib.request.urlopen(ack_req)

            # Обновить сообщение
            edit_url = f"https://api.telegram.org/bot{bot_token}/editMessageText"
            edit_payload = json.dumps({
                "chat_id": from_chat_id,
                "message_id": cq["message"]["message_id"],
                "text": cq["message"]["text"] + f"\n\n{answer_text}",
            }).encode()
            edit_req = urllib.request.Request(edit_url, data=edit_payload, method="POST", headers={"Content-Type": "application/json"})
            try:
                urllib.request.urlopen(edit_req)
            except Exception:
                pass

            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"ok": True}),
            }

        # Прямой вызов с review_id (из фронтенда)
        direct_id = body.get("review_id")
        if direct_id:
            conn = psycopg2.connect(os.environ["DATABASE_URL"])
            cur = conn.cursor()
            cur.execute("UPDATE reviews SET approved = TRUE WHERE id = %s RETURNING id", (int(direct_id),))
            conn.commit()
            cur.close()
            conn.close()
            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"success": True}),
            }

    return {
        "statusCode": 400,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"error": "Bad request"}),
    }
