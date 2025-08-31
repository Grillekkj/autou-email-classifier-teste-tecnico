from striprtf.striprtf import rtf_to_text
import extract_msg
import tempfile
import os
import re

from .base_extractor import FileExtractor


class MsgExtractor(FileExtractor):
    def extract(self, file):
        temp_path = self._save_temp_file(file)

        try:
            with extract_msg.openMsg(temp_path) as msg:
                body = self._extract_body(msg)
                subject = msg.subject
                return body, subject
        except Exception as e:
            print(f"Erro ao ler o MSG: {e}")
            return (
                "Erro ao processar o arquivo MSG.",
                None,
            )
        finally:
            self._cleanup_temp_file(temp_path)

    def _save_temp_file(self, file):
        temp_path = os.path.join(tempfile.gettempdir(), file.filename)
        file.seek(0)
        with open(temp_path, "wb") as f:
            f.write(file.read())
        return temp_path

    def _cleanup_temp_file(self, path):
        if os.path.exists(path):
            os.remove(path)

    def _extract_body(self, msg):
        if msg.body:
            return msg.body.strip()

        if msg.htmlBody:
            return self._decode_html(msg.htmlBody)

        if msg.rtfBody:
            return self._decode_rtf(msg.rtfBody)

        return "O arquivo MSG não contém corpo legível."

    def _decode_html(self, html_bytes):
        try:
            html_text = (
                html_bytes.decode("utf-8")
                if isinstance(html_bytes, bytes)
                else html_bytes
            )
        except UnicodeDecodeError:
            html_text = (
                html_bytes.decode("latin-1", errors="ignore")
                if isinstance(html_bytes, bytes)
                else html_bytes
            )
        return re.sub("<[^<]+?>", "", html_text).strip()

    def _decode_rtf(self, rtf_bytes):
        text = (
            rtf_bytes.decode("utf-8", errors="ignore")
            if isinstance(rtf_bytes, bytes)
            else rtf_bytes
        )
        text = rtf_to_text(text)
        return text.strip()
