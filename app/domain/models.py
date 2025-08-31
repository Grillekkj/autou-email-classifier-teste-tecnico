from dataclasses import dataclass, field
from typing import List, Dict


@dataclass
class AnalysisResult:
    assunto: str
    email_original: str
    categoria: str
    resumo: str
    resposta_sugerida: str
    tipo_arquivo: str
    timestamp: str


@dataclass
class ZipAnalysisResult:
    is_zip: bool = True
    assunto: str = ""
    tipo_arquivo: str = "zip"
    timestamp: str = ""
    arquivos_internos: List[AnalysisResult] = field(default_factory=list)

    @property
    def quantidade(self) -> int:
        return len(self.arquivos_internos)


@dataclass
class UserSettings:
    greeting: str = ""
    signature: str = ""
    models: Dict[str, str] = field(default_factory=dict)
    prompts: Dict[str, str] = field(default_factory=dict)
