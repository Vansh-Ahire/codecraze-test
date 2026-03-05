from config import Config


def build_navigation_path(slot_number: int) -> dict:
    """
    Build step-by-step navigation for a given slot number (1–24)
    Layout: 6 rows (A–F) × 4 columns (1–4)
    """
    row       = (slot_number - 1) // Config.COLS
    col       = (slot_number - 1) % Config.COLS
    row_label = chr(65 + row)
    col_label = col + 1

    steps = [
        "🚶 Start at ENTRY GATE",
        "➡️  Proceed to MAIN AISLE",
        f"↩️  Turn into ROW {row_label}",
        f"🔢 Go to COLUMN {col_label}",
        f"🅿️  Your slot is S{slot_number:02d}",
        "🚗 Vehicle located!"
    ]

    return {
        "slot_number":   slot_number,
        "row_label":     row_label,
        "col_label":     col_label,
        "grid_position": {"row": row, "col": col},
        "steps":         steps
    }
