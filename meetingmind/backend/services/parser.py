import re

def parse_vtt(vtt_content: str) -> str:
    """
    Strips WEBVTT headers and timestamps from a VTT file content,
    returning clean dialogue text.
    """
    lines = vtt_content.splitlines()
    clean_lines = []
    
    # Regex to match common VTT timestamp formats
    timestamp_pattern = re.compile(r'^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}.*$|^\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}\.\d{3}.*$')
    
    for line in lines:
        line_stripped = line.strip()
        # Skip empty lines, WEBVTT header, and timestamp lines
        if not line_stripped or line_stripped == "WEBVTT" or timestamp_pattern.match(line_stripped):
            continue
        # Also skip cue identifiers if they are just numbers
        if line_stripped.isdigit():
            continue
        clean_lines.append(line_stripped)
        
    return " ".join(clean_lines)

def parse_text(text_content: str) -> str:
    return text_content.strip()
