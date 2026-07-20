# CodeArea external utilities

These independently versioned Git submodules restore the repositories previously nested below the backend:

- [`executor`](executor/README.md): `https://github.com/raksitbell/piston.git`, pinned to the previously used Piston revision.
- [`chatbot`](chatbot/README.md): `https://github.com/raksitbell/codearea_chatbot.git`, pinned to the previously used chatbot revision.

Initialize them with `git submodule update --init --recursive`. The consolidated Next.js application uses Piston through `PISTON_URL` and calls Ollama directly through `OLLAMA_URL`; the legacy chatbot service is not placed in the root Compose stack.
