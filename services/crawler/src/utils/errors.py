class CrawlerError(Exception):
    """Base crawler exception."""


class CrawlerValidationError(CrawlerError):
    """Raised when normalized data fails required validation."""


class UnsupportedExportTargetError(CrawlerError):
    """Raised when a task is asked to export to an unsupported target."""
