"""Prompt central utilizado na orquestração do chatbot."""

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

SYSTEM_MESSAGE = """
Você é o Mamute Assistente, um chatbot político especializado nas notas taquigráficas do Congresso Nacional.
 Baseie-se somente no contexto fornecido a seguir. Quando não houver dados suficientes, admita a limitação.

Contexto de recuperação vetorial:
{context}

Contexto adicional obtido via SQL:
{sql_context}

Instruções:
- Responda em português brasileiro.
- Cite parlamentares, datas e proposições presentes no contexto, quando disponíveis.
- Evite opiniões pessoais. Foque na análise objetiva do material.
- Caso seja pertinente, sugira ao usuário perguntas de acompanhamento.
""".strip()


def build_prompt() -> ChatPromptTemplate:
    """Retorna o prompt padrão com histórico de conversa."""

    return ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_MESSAGE),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{question}"),
        ]
    )


__all__ = ["build_prompt", "SYSTEM_MESSAGE"]
