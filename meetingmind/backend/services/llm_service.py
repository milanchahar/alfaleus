import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client for Groq
api_key = os.getenv("GROK_API_KEY")
client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
)

MODEL_NAME = "llama-3.3-70b-versatile"

def safe_parse_json(text: str) -> dict:
    """Strips markdown code fences and parses JSON securely."""
    text = text.strip()
    # Remove markdown code fences if present
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text)
        text = re.sub(r"```$", "", text)
    return json.loads(text.strip())

def analyze_meeting(transcript_text: str) -> dict:
    system_prompt = """You are an expert meeting analyst. Your job is to process raw meeting 
transcripts or notes and extract structured information. Always respond 
with valid JSON only. No markdown fences. No explanation. Just JSON."""

    user_prompt = f"""Analyze the following meeting transcript carefully and return a JSON 
object with EXACTLY these keys:

{{
  "title": "A short 5-8 word title summarizing the meeting topic",
  "summary": "3-4 sentence paragraph summarizing the key discussion points, context, and outcomes of the meeting.",
  "action_items": [
    {{
      "description": "Clear description of the task",
      "assignee": "Name of person responsible (or 'Unassigned' if unclear)",
      "deadline": "Deadline if mentioned (or null if not present)"
    }}
  ],
  "decisions": [
    "Decision 1 as a clear declarative sentence",
    "Decision 2..."
  ]
}}

Rules:
- Extract assignees ONLY from names explicitly mentioned near a task.
- If a name is ambiguous or only a role is mentioned (e.g. "the dev team"),
  use that role as the assignee value and flag it with a "(inferred)" suffix.
- If no deadline is mentioned, set deadline to null. Never invent dates.
- decisions must be definitive outcomes, not action items.
- Minimum 1 action item. If truly none exist, add one placeholder.
- Return ONLY the JSON. No commentary. No code fences.

MEETING TRANSCRIPT:
{transcript_text}"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.0
    )
    
    response_text = response.choices[0].message.content
    return safe_parse_json(response_text)


def generate_follow_up_email(summary: str, action_items_formatted: str, decisions_formatted: str) -> dict:
    system_prompt = """You are a professional business communication specialist. 
Write concise, polished corporate emails."""

    user_prompt = f"""Write a professional follow-up email based on this meeting.

Meeting Summary:
{summary}

Action Items:
{action_items_formatted}

Decisions Made:
{decisions_formatted}

Return a JSON object with exactly two keys:
{{
  "subject": "Email subject line",
  "body": "Full email body with greeting, recap, action items listed clearly, next steps, and a professional sign-off. Use \\n for line breaks."
}}

Tone: Professional, concise, corporate.
Return ONLY the JSON. No code fences."""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.0
    )
    
    response_text = response.choices[0].message.content
    return safe_parse_json(response_text)


def chat_with_meeting(meeting, chat_history: list, new_message: str) -> str:
    system_prompt = f"""You are a helpful meeting assistant. You have access to the full notes 
and analysis of a meeting. Answer questions about it clearly and 
concisely. Stay grounded in the meeting data — do not hallucinate 
facts not present in the transcript.

MEETING CONTEXT:
Title: {meeting.title}
Summary: {meeting.summary}
Action Items: {json.dumps(meeting.action_items)}
Decisions: {json.dumps(meeting.decisions)}
Full Transcript:
{meeting.raw_text[:3000]}"""

    messages = [
        {"role": "system", "content": system_prompt}
    ]
    for msg in chat_history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    messages.append({"role": "user", "content": new_message})

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.0
    )
    
    return response.choices[0].message.content
