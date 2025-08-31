from abc import ABC, abstractmethod


class FileExtractor(ABC):
    @abstractmethod
    def extract(self, file) -> tuple[str, str]:
        pass
