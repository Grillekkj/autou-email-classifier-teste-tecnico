import email
from email import policy

from .base_extractor import FileExtractor


class EmlExtractor(FileExtractor):
    def extract(self, file):
        try:
            raw_email = file.read()
            msg = email.message_from_bytes(raw_email, policy=policy.default)
            subject = msg["subject"]
            body = ""

            if msg.is_multipart():
                for part in msg.walk():
                    if (
                        part.get_content_type() == "text/plain"
                        and "attachment" not in str(part.get("Content-Disposition"))
                    ):
                        payload = part.get_payload(decode=True)

                        if payload:
                            body = payload.decode(errors="ignore")
                            break

            else:
                payload = msg.get_payload(decode=True)

                if payload:
                    body = payload.decode(errors="ignore")

            return body, subject
        except Exception as e:
            print(f"Erro ao ler o EML: {e}")
            return (
                "Erro ao processar o arquivo EML.",
                None,
            )
