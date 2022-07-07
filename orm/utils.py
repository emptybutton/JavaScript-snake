def get_column_data_from_model_type(column_name: str, model_type: type):
    """Speeds up the "parsing" of the model column by its name."""

    return getattr(model_type, column_name).comparator
