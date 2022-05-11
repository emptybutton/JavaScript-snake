class DataOverseerResponse:
    """Overseer message about data correctness"""

    def __init__(self, sign: bool, message: str):
        self.sign = sign
        self.message = message

    def __bool__(self) -> bool:
        return self.sign

    def __str__(self) -> str:
        return self.message

    def __repr__(self) -> str:
        return f"<__{'Positive' if self.sign else 'Negative'}_response: \"{self.message}\">"
