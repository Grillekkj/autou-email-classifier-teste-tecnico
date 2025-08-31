# app/services/strategies/__init__.py
from .pdf_extractor import PdfExtractor
from .txt_extractor import TxtExtractor
from .eml_extractor import EmlExtractor
from .msg_extractor import MsgExtractor

# Mapeamento para ser usado no serviço principal
EXTRACTOR_MAPPING = {
    ".pdf": PdfExtractor(),
    ".txt": TxtExtractor(),
    ".eml": EmlExtractor(),
    ".msg": MsgExtractor(),
}
