import json
import os
import urllib.request
import urllib.parse


def handler(event: dict, context) -> dict:
    """Принимает заявку на консультацию и отправляет уведомление в Telegram"""

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
    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    service = body.get("service", "").strip()
    message = body.get("message", "").strip()
    date = body.get("date", "").strip()
    time = body.get("time", "").strip()

    if not name or not phone or not date or not time:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Заполните обязательные поля"}),
        }

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]

    text = (
        f"🔮 *Новая запись на консультацию!*\n\n"
        f"👤 *Имя:* {name}\n"
        f"📞 *Контакт:* {phone}\n"
        f"📅 *Дата:* {date}\n"
        f"⏰ *Время:* {time}\n"
        f"✨ *Услуга:* {service if service else 'Не указана'}\n"
        f"💬 *О ситуации:* {message if message else 'Не указано'}"
    )

    tg_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    tg_data = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
    }).encode()

    req = urllib.request.Request(tg_url, data=tg_data, method="POST")
    urllib.request.urlopen(req)

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"success": True}),
    }
