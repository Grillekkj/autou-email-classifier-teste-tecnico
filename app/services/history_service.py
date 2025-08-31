from typing import List

from app.domain.models import AnalysisResult, ZipAnalysisResult


class HistoryService:
    def __init__(self):
        self._history: List[AnalysisResult | ZipAnalysisResult] = []

    def get_full_history(self) -> List[AnalysisResult | ZipAnalysisResult]:
        return self._history

    def add_to_history(self, results: List[AnalysisResult | ZipAnalysisResult]):
        for item in reversed(results):
            self._history.insert(0, item)

    def find_item(self, history_id: int, sub_id: int = None):
        if not (0 <= history_id < len(self._history)):
            raise IndexError("Índice do histórico inválido")

        item = self._history[history_id]

        if sub_id is not None:
            if isinstance(item, ZipAnalysisResult) and 0 <= sub_id < len(
                item.arquivos_internos
            ):
                return item.arquivos_internos[sub_id]
            else:
                raise IndexError("Índice do sub-item inválido")
        return item

    def delete_history_item(self, history_id: int, sub_id: int = None):
        self.find_item(history_id)

        if sub_id is not None:
            zip_container = self._history[history_id]

            if isinstance(zip_container, ZipAnalysisResult):
                del zip_container.arquivos_internos[sub_id]

                if not zip_container.arquivos_internos:
                    self._history.pop(history_id)

        else:
            self._history.pop(history_id)
