from typing import List, Dict

from app.domain.models import AnalysisResult, ZipAnalysisResult


class HistoryService:
    def __init__(self):
        self._history: Dict[str, List[AnalysisResult | ZipAnalysisResult]] = {}

    def get_full_history(
        self, user_id: str
    ) -> List[AnalysisResult | ZipAnalysisResult]:
        return self._history.get(user_id, [])

    def add_to_history(
        self, user_id: str, results: List[AnalysisResult | ZipAnalysisResult]
    ):
        user_history = self._history.setdefault(user_id, [])
        for item in reversed(results):
            user_history.insert(0, item)

    def find_item(self, user_id: str, history_id: int, sub_id: int = None):
        user_history = self.get_full_history(user_id)
        if not (0 <= history_id < len(user_history)):
            raise IndexError("Índice do histórico inválido")

        item = user_history[history_id]

        if sub_id is not None:
            if isinstance(item, ZipAnalysisResult) and 0 <= sub_id < len(
                item.arquivos_internos
            ):
                return item.arquivos_internos[sub_id]
            else:
                raise IndexError("Índice do sub-item inválido")
        return item

    def delete_history_item(self, user_id: str, history_id: int, sub_id: int = None):
        self.find_item(user_id, history_id)
        user_history = self.get_full_history(user_id)

        if sub_id is not None:
            zip_container = user_history[history_id]

            if isinstance(zip_container, ZipAnalysisResult):
                del zip_container.arquivos_internos[sub_id]

                if not zip_container.arquivos_internos:
                    user_history.pop(history_id)
        else:
            user_history.pop(history_id)
