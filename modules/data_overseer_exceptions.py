class ThemeError(AttributeError):
    """Theme error group class"""


class NoThemeError(ThemeError):
    """The class of the missing theme error. Has a message template that is padded during initialization"""
    
    message = "Theme \"{theme}\" is missing"

    def __init__(self, theme: str):
        super().__init__(self.message.format(theme=theme))
